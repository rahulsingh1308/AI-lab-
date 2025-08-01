import os
import json
from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import pyarrow.parquet as pq
from io import BytesIO
import zipfile

app = Flask(__name__)

# Configuration
DATA_ROOT_PATH = "data"  # This will be the folder containing your CSV and Parquet files

def get_available_folders():
    """Get list of folders containing CSV or Parquet files"""
    folders = []
    if not os.path.exists(DATA_ROOT_PATH):
        os.makedirs(DATA_ROOT_PATH)
        return folders
    
    for item in os.listdir(DATA_ROOT_PATH):
        item_path = os.path.join(DATA_ROOT_PATH, item)
        if os.path.isdir(item_path):
            # Check if folder contains CSV or Parquet files
            files = os.listdir(item_path)
            has_data_files = any(f.endswith(('.csv', '.parquet', '.parq')) for f in files)
            if has_data_files:
                folders.append(item)
    
    return folders

def get_files_in_folder(folder_name):
    """Get CSV and Parquet files in a specific folder"""
    folder_path = os.path.join(DATA_ROOT_PATH, folder_name)
    if not os.path.exists(folder_path):
        return []
    
    files = []
    for file in os.listdir(folder_path):
        if file.endswith(('.csv', '.parquet', '.parq')):
            files.append(file)
    
    return files

def read_file_data(folder_name, file_name):
    """Read CSV or Parquet file and return DataFrame"""
    file_path = os.path.join(DATA_ROOT_PATH, folder_name, file_name)
    
    try:
        if file_name.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_name.endswith(('.parquet', '.parq')):
            df = pd.read_parquet(file_path)
        else:
            return None
        return df
    except Exception as e:
        print(f"Error reading file {file_path}: {str(e)}")
        return None

@app.route('/')
def home():
    """Home page showing available folders"""
    folders = get_available_folders()
    return render_template('home.html', folders=folders)

@app.route('/folder/<folder_name>')
def folder_view(folder_name):
    """View files in a specific folder"""
    files = get_files_in_folder(folder_name)
    return render_template('folder.html', folder_name=folder_name, files=files)

@app.route('/api/file-info/<folder_name>/<file_name>')
def get_file_info(folder_name, file_name):
    """Get file information including columns and sample data"""
    df = read_file_data(folder_name, file_name)
    
    if df is None:
        return jsonify({'error': 'Could not read file'}), 400
    
    # Get column information
    columns_info = []
    for col in df.columns:
        col_type = str(df[col].dtype)
        unique_values = df[col].unique()[:100].tolist()  # Limit to first 100 unique values
        
        columns_info.append({
            'name': col,
            'type': col_type,
            'unique_values': unique_values,
            'unique_count': df[col].nunique()
        })
    
    # Get sample data
    sample_data = df.head(10).to_dict('records')
    
    return jsonify({
        'columns': columns_info,
        'sample_data': sample_data,
        'total_rows': len(df),
        'total_columns': len(df.columns)
    })

@app.route('/api/query-data/<folder_name>/<file_name>', methods=['POST'])
def query_data(folder_name, file_name):
    """Query data with filters"""
    df = read_file_data(folder_name, file_name)
    
    if df is None:
        return jsonify({'error': 'Could not read file'}), 400
    
    # Get filters from request
    filters = request.json.get('filters', [])
    
    # Apply filters
    filtered_df = df.copy()
    for filter_item in filters:
        column = filter_item.get('column')
        operator = filter_item.get('operator')
        value = filter_item.get('value')
        
        if column not in df.columns:
            continue
            
        try:
            if operator == 'equals':
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == 'not_equals':
                filtered_df = filtered_df[filtered_df[column] != value]
            elif operator == 'contains':
                filtered_df = filtered_df[filtered_df[column].astype(str).str.contains(str(value), na=False)]
            elif operator == 'greater_than':
                filtered_df = filtered_df[filtered_df[column] > float(value)]
            elif operator == 'less_than':
                filtered_df = filtered_df[filtered_df[column] < float(value)]
            elif operator == 'greater_equal':
                filtered_df = filtered_df[filtered_df[column] >= float(value)]
            elif operator == 'less_equal':
                filtered_df = filtered_df[filtered_df[column] <= float(value)]
        except Exception as e:
            print(f"Error applying filter: {str(e)}")
            continue
    
    # Pagination
    page = request.json.get('page', 1)
    per_page = request.json.get('per_page', 50)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    paginated_df = filtered_df.iloc[start_idx:end_idx]
    
    return jsonify({
        'data': paginated_df.to_dict('records'),
        'total_rows': len(filtered_df),
        'current_page': page,
        'per_page': per_page,
        'total_pages': (len(filtered_df) + per_page - 1) // per_page
    })

@app.route('/api/download/<folder_name>/<file_name>')
def download_data(folder_name, file_name):
    """Download filtered data"""
    df = read_file_data(folder_name, file_name)
    
    if df is None:
        return jsonify({'error': 'Could not read file'}), 400
    
    # Get filters from query parameters
    filters_json = request.args.get('filters', '[]')
    try:
        filters = json.loads(filters_json)
    except:
        filters = []
    
    # Apply filters (same logic as query_data)
    filtered_df = df.copy()
    for filter_item in filters:
        column = filter_item.get('column')
        operator = filter_item.get('operator')
        value = filter_item.get('value')
        
        if column not in df.columns:
            continue
            
        try:
            if operator == 'equals':
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == 'not_equals':
                filtered_df = filtered_df[filtered_df[column] != value]
            elif operator == 'contains':
                filtered_df = filtered_df[filtered_df[column].astype(str).str.contains(str(value), na=False)]
            elif operator == 'greater_than':
                filtered_df = filtered_df[filtered_df[column] > float(value)]
            elif operator == 'less_than':
                filtered_df = filtered_df[filtered_df[column] < float(value)]
            elif operator == 'greater_equal':
                filtered_df = filtered_df[filtered_df[column] >= float(value)]
            elif operator == 'less_equal':
                filtered_df = filtered_df[filtered_df[column] <= float(value)]
        except Exception as e:
            continue
    
    # Create CSV in memory
    output = BytesIO()
    filtered_df.to_csv(output, index=False)
    output.seek(0)
    
    # Prepare filename
    base_name = os.path.splitext(file_name)[0]
    download_filename = f"{base_name}_filtered.csv"
    
    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=download_filename
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)