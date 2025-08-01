# Data Query Tool

A web-based application for querying, filtering, and downloading data from CSV and Parquet files stored in local folders. This tool provides an intuitive interface to explore your data with powerful filtering capabilities.

## Features

- 📁 **Folder-based Organization**: Automatically scans and displays folders containing CSV/Parquet files
- 🔍 **Advanced Filtering**: Apply multiple filters on any column with various operators
- 📊 **Data Preview**: View data with pagination and file statistics
- 💾 **Download Filtered Results**: Export filtered data as CSV files
- 🎨 **Modern UI**: Responsive design with Bootstrap 5
- ⚡ **Fast Performance**: Efficient data processing with pandas and pyarrow

## Supported File Formats

- CSV files (`.csv`)
- Parquet files (`.parquet`, `.parq`)

## Filter Operators

- **Equals**: Exact match
- **Not Equals**: Exclude exact matches
- **Contains**: Text contains substring
- **Greater Than**: Numeric comparison (>)
- **Less Than**: Numeric comparison (<)
- **Greater or Equal**: Numeric comparison (>=)
- **Less or Equal**: Numeric comparison (<=)

## Installation

1. **Clone or download this project** to your desired location
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Project Structure

```
Project_1/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── create_sample_data.py  # Script to generate sample data
├── templates/            # HTML templates
│   ├── base.html
│   ├── home.html
│   └── folder.html
├── static/              # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── file-viewer.js
└── data/               # Data directory (create this)
    ├── folder1/        # Your data folders go here
    │   ├── file1.csv
    │   └── file2.parquet
    └── folder2/
        └── file3.csv
```

## Setup Instructions

### Step 1: Organize Your Data

1. Create a `data/` directory in the project root
2. Create subfolders for different data categories
3. Place your CSV and Parquet files in these subfolders

Example structure:
```
data/
├── sales_data/
│   ├── sales_2023.csv
│   └── sales_2022.parquet
├── customer_data/
│   └── customers.csv
└── product_data/
    └── products.parquet
```

### Step 2: Generate Sample Data (Optional)

To test the application with sample data:

```bash
python create_sample_data.py
```

This creates sample sales, customer, and product data files.

### Step 3: Run the Application

```bash
python app.py
```

The application will be available at: `http://localhost:5000`

## Usage Guide

### 1. Home Page
- View all available data folders
- Click on any folder to explore its contents
- Folders are only displayed if they contain CSV or Parquet files

### 2. Folder View
- See all data files in the selected folder
- Click "View Data" on any file to open the data viewer

### 3. Data Viewer
- **File Statistics**: View total rows and columns
- **Add Filters**: Click "Add Filter" to create new filter conditions
  - Select column from dropdown
  - Choose comparison operator
  - Enter filter value or select from unique values
- **Apply Filters**: Process filters and update data display
- **Clear Filters**: Remove all filters and show original data
- **Download**: Export filtered data as CSV file
- **Pagination**: Navigate through large datasets

### 4. Filter Examples

**Text Filtering:**
- Column: `customer_name`
- Operator: `Contains`
- Value: `John`

**Numeric Filtering:**
- Column: `total_amount`
- Operator: `Greater Than`
- Value: `1000`

**Exact Match:**
- Column: `region`
- Operator: `Equals`
- Value: `North`

## Configuration

### Change Data Directory

In `app.py`, modify the `DATA_ROOT_PATH` variable:

```python
DATA_ROOT_PATH = "your/custom/path"
```

### Adjust Pagination

In `app.py`, change the `per_page` parameter in the query functions:

```python
per_page = request.json.get('per_page', 100)  # Default 50, change to 100
```

## Technical Details

### Backend (Flask)
- **Framework**: Flask with Python
- **Data Processing**: pandas for CSV, pyarrow for Parquet
- **API Endpoints**:
  - `/` - Home page
  - `/folder/<name>` - Folder view
  - `/api/file-info/<folder>/<file>` - File metadata
  - `/api/query-data/<folder>/<file>` - Filtered data query
  - `/api/download/<folder>/<file>` - Download filtered data

### Frontend
- **Framework**: Bootstrap 5 for responsive design
- **JavaScript**: Vanilla JS with jQuery for AJAX requests
- **Features**: Dynamic filtering, pagination, modal dialogs

### Data Processing
- **Large Files**: Pagination handles large datasets efficiently
- **Memory Management**: Data is processed in chunks to manage memory usage
- **Error Handling**: Graceful handling of file read errors and filter failures

## Performance Tips

1. **File Organization**: Keep related files in separate folders
2. **File Size**: For very large files (>1GB), consider splitting into smaller chunks
3. **Filtering**: Use specific filters to reduce data transfer
4. **Parquet Format**: Use Parquet for better performance with large datasets

## Troubleshooting

### Common Issues

**No folders showing on home page:**
- Ensure the `data/` directory exists
- Check that subfolders contain CSV or Parquet files

**File won't open:**
- Verify file format is supported (CSV or Parquet)
- Check file permissions
- Ensure file isn't corrupted

**Filtering not working:**
- Check data types match filter operators
- Ensure column names are exact matches
- Try using "Contains" for text searches

**Performance issues:**
- Reduce pagination size for large files
- Use more specific filters to limit data
- Consider converting CSV files to Parquet format

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your data format and structure
3. Test with the provided sample data

---

**Happy Data Exploring! 🚀**