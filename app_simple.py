import os
import json
from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO
import csv

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

def read_csv_simple(file_path, max_rows=1000):
    """Simple CSV reader without pandas"""
    try:
        data = []
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            columns = reader.fieldnames
            for i, row in enumerate(reader):
                if i >= max_rows:
                    break
                data.append(row)
        return data, columns
    except Exception as e:
        print(f"Error reading file {file_path}: {str(e)}")
        return None, None

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
    file_path = os.path.join(DATA_ROOT_PATH, folder_name, file_name)
    
    if not file_name.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported in this demo version'}), 400
    
    data, columns = read_csv_simple(file_path, max_rows=10)
    
    if data is None:
        return jsonify({'error': 'Could not read file'}), 400
    
    # Get column information (simplified)
    columns_info = []
    if columns:
        for col in columns:
            # Get unique values from sample data
            unique_values = list(set([row.get(col, '') for row in data if row.get(col, '')]))[:50]
            
            columns_info.append({
                'name': col,
                'type': 'text',  # Simplified - assume all text
                'unique_values': unique_values,
                'unique_count': len(unique_values)
            })
    
    return jsonify({
        'columns': columns_info,
        'sample_data': data,
        'total_rows': len(data),
        'total_columns': len(columns) if columns else 0
    })

@app.route('/api/query-data/<folder_name>/<file_name>', methods=['POST'])
def query_data(folder_name, file_name):
    """Query data with filters (simplified)"""
    file_path = os.path.join(DATA_ROOT_PATH, folder_name, file_name)
    
    if not file_name.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported in this demo version'}), 400
    
    data, columns = read_csv_simple(file_path, max_rows=1000)
    
    if data is None:
        return jsonify({'error': 'Could not read file'}), 400
    
    # Get filters from request
    filters = request.json.get('filters', [])
    
    # Apply simple filters
    filtered_data = data.copy()
    for filter_item in filters:
        column = filter_item.get('column')
        operator = filter_item.get('operator')
        value = filter_item.get('value', '').lower()
        
        if column not in columns:
            continue
            
        try:
            if operator == 'equals':
                filtered_data = [row for row in filtered_data if row.get(column, '').lower() == value]
            elif operator == 'not_equals':
                filtered_data = [row for row in filtered_data if row.get(column, '').lower() != value]
            elif operator == 'contains':
                filtered_data = [row for row in filtered_data if value in row.get(column, '').lower()]
        except Exception as e:
            print(f"Error applying filter: {str(e)}")
            continue
    
    # Simple pagination
    page = request.json.get('page', 1)
    per_page = request.json.get('per_page', 50)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    paginated_data = filtered_data[start_idx:end_idx]
    
    return jsonify({
        'data': paginated_data,
        'total_rows': len(filtered_data),
        'current_page': page,
        'per_page': per_page,
        'total_pages': (len(filtered_data) + per_page - 1) // per_page
    })

@app.route('/api/download/<folder_name>/<file_name>')
def download_data(folder_name, file_name):
    """Download filtered data (simplified)"""
    file_path = os.path.join(DATA_ROOT_PATH, folder_name, file_name)
    
    if not file_name.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported in this demo version'}), 400
    
    # For demo, just return the original file
    return send_file(file_path, as_attachment=True, download_name=f"filtered_{file_name}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)