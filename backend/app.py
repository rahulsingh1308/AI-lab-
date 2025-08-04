import os
import pandas as pd
import json
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import tempfile
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Configuration
DATA_ROOT_PATH = os.environ.get('DATA_ROOT_PATH', './data')

def scan_folders_for_data_files():
    """Scan for folders containing CSV or Parquet files"""
    folders_with_data = []
    
    if not os.path.exists(DATA_ROOT_PATH):
        return folders_with_data
    
    for root, dirs, files in os.walk(DATA_ROOT_PATH):
        data_files = [f for f in files if f.lower().endswith(('.csv', '.parquet'))]
        if data_files:
            folder_path = os.path.relpath(root, DATA_ROOT_PATH)
            if folder_path == '.':
                folder_path = 'root'
            folders_with_data.append({
                'folder_name': folder_path,
                'folder_path': root,
                'file_count': len(data_files),
                'files': data_files
            })
    
    return folders_with_data

def read_data_file(file_path, nrows=None):
    """Read CSV or Parquet file and return DataFrame"""
    file_extension = Path(file_path).suffix.lower()
    
    try:
        if file_extension == '.csv':
            df = pd.read_csv(file_path, nrows=nrows)
        elif file_extension == '.parquet':
            df = pd.read_parquet(file_path)
            if nrows:
                df = df.head(nrows)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        return df
    except Exception as e:
        raise Exception(f"Error reading file {file_path}: {str(e)}")

@app.route('/api/folders', methods=['GET'])
def get_folders():
    """Get all folders containing data files"""
    try:
        folders = scan_folders_for_data_files()
        return jsonify({
            'success': True,
            'folders': folders,
            'total_folders': len(folders)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/files/<path:folder_path>', methods=['GET'])
def get_files_in_folder(folder_path):
    """Get all data files in a specific folder"""
    try:
        if folder_path == 'root':
            full_path = DATA_ROOT_PATH
        else:
            full_path = os.path.join(DATA_ROOT_PATH, folder_path)
        
        if not os.path.exists(full_path):
            return jsonify({
                'success': False,
                'error': 'Folder not found'
            }), 404
        
        files = []
        for file in os.listdir(full_path):
            if file.lower().endswith(('.csv', '.parquet')):
                file_path = os.path.join(full_path, file)
                file_stats = os.stat(file_path)
                files.append({
                    'name': file,
                    'path': file_path,
                    'size': file_stats.st_size,
                    'modified': file_stats.st_mtime,
                    'type': Path(file).suffix.lower()
                })
        
        return jsonify({
            'success': True,
            'files': files,
            'folder_path': folder_path
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/preview', methods=['POST'])
def preview_file():
    """Preview data from a file with optional filtering"""
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        filters = data.get('filters', {})
        page = data.get('page', 1)
        page_size = data.get('page_size', 100)
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Read the file
        df = read_data_file(file_path)
        
        # Apply filters
        filtered_df = df.copy()
        for column, filter_value in filters.items():
            if column in filtered_df.columns and filter_value:
                if filtered_df[column].dtype == 'object':
                    # String filtering (case insensitive contains)
                    filtered_df = filtered_df[
                        filtered_df[column].astype(str).str.contains(
                            str(filter_value), case=False, na=False
                        )
                    ]
                else:
                    # Numeric filtering (exact match for now)
                    try:
                        numeric_value = float(filter_value)
                        filtered_df = filtered_df[filtered_df[column] == numeric_value]
                    except (ValueError, TypeError):
                        continue
        
        # Pagination
        total_rows = len(filtered_df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_df = filtered_df.iloc[start_idx:end_idx]
        
        # Convert to JSON-serializable format
        data_dict = paginated_df.to_dict('records')
        
        # Get column information
        columns_info = []
        for col in df.columns:
            columns_info.append({
                'name': col,
                'type': str(df[col].dtype),
                'unique_values': int(df[col].nunique()) if df[col].nunique() < 100 else 100,
                'null_count': int(df[col].isnull().sum())
            })
        
        return jsonify({
            'success': True,
            'data': data_dict,
            'columns': columns_info,
            'total_rows': total_rows,
            'filtered_rows': len(filtered_df),
            'page': page,
            'page_size': page_size,
            'total_pages': (total_rows + page_size - 1) // page_size
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/download', methods=['POST'])
def download_file():
    """Download filtered data as CSV"""
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        filters = data.get('filters', {})
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Read and filter the file
        df = read_data_file(file_path)
        
        # Apply filters
        filtered_df = df.copy()
        for column, filter_value in filters.items():
            if column in filtered_df.columns and filter_value:
                if filtered_df[column].dtype == 'object':
                    filtered_df = filtered_df[
                        filtered_df[column].astype(str).str.contains(
                            str(filter_value), case=False, na=False
                        )
                    ]
                else:
                    try:
                        numeric_value = float(filter_value)
                        filtered_df = filtered_df[filtered_df[column] == numeric_value]
                    except (ValueError, TypeError):
                        continue
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
        filtered_df.to_csv(temp_file.name, index=False)
        temp_file.close()
        
        # Generate filename
        original_name = Path(file_path).stem
        download_name = f"{original_name}_filtered.csv"
        
        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=download_name,
            mimetype='text/csv'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Data Explorer API is running',
        'data_root_path': DATA_ROOT_PATH
    })

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs(DATA_ROOT_PATH, exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)