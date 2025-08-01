# Data Query Tool - Deployment Guide

## Quick Start

### 1. Transfer to Your Windows Machine

Copy the entire project to `C:\Users\2113085\OneDrive - Cognizant\Desktop\Project_1`

### 2. Install Python Requirements

```bash
# Navigate to the project directory
cd "C:\Users\2113085\OneDrive - Cognizant\Desktop\Project_1"

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Create Sample Data (Optional)

```bash
python create_sample_csv.py
```

### 4. Run the Application

```bash
# Using the simplified version (CSV only)
python app_simple.py

# Or for full version (requires pandas/pyarrow)
python app.py
```

### 5. Access the Application

Open your browser and go to: `http://localhost:5000`

## Project Files Overview

### Core Application Files
- `app.py` - Full Flask application with pandas support
- `app_simple.py` - Simplified Flask application (CSV only)
- `requirements.txt` - Python dependencies

### Frontend Files
- `templates/` - HTML templates
  - `base.html` - Base template with navigation
  - `home.html` - Home page showing folders
  - `folder.html` - Folder view showing files
- `static/` - CSS and JavaScript files
  - `css/style.css` - Custom styling
  - `js/file-viewer.js` - Frontend functionality

### Data Setup
- `create_sample_csv.py` - Generate sample CSV data
- `create_sample_data.py` - Generate sample data with pandas (requires pandas)
- `data/` - Directory for your data files

### Documentation
- `README.md` - Main project documentation
- `DEPLOYMENT_GUIDE.md` - This deployment guide

## Features Implemented ✅

1. **Folder-based Organization**: Automatically scans and displays data folders
2. **File Support**: CSV files (Parquet requires pandas installation)
3. **Data Preview**: View file contents with pagination
4. **Column Filtering**: Apply filters with various operators
5. **Download Functionality**: Export filtered data
6. **Responsive UI**: Modern Bootstrap-based interface

## Important Notes

### Version Differences

**app_simple.py** (Recommended for quick start):
- ✅ No external dependencies (uses built-in CSV module)
- ✅ Fast installation and setup
- ✅ Supports CSV files only
- ✅ Basic filtering (equals, not equals, contains)

**app.py** (Full featured):
- ✅ Full pandas/pyarrow support
- ✅ Supports CSV and Parquet files
- ✅ Advanced filtering and data types
- ❌ Requires pandas installation (may have compatibility issues)

### For Production Use

1. **Install pandas and pyarrow** for full functionality:
   ```bash
   pip install pandas==2.1.0 pyarrow==13.0.0
   ```

2. **Use app.py** for the complete feature set

3. **Configure data path** in the application:
   ```python
   DATA_ROOT_PATH = r"C:\path\to\your\data"
   ```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change port in app: `app.run(port=5001)`

2. **Permission errors**:
   - Run Command Prompt as Administrator
   - Check file permissions in data directory

3. **Module not found**:
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`

4. **Pandas installation fails**:
   - Use `app_simple.py` for CSV-only functionality
   - Try: `pip install pandas --no-build-isolation`

### Data Organization

Your data should be organized like this:
```
C:\Users\2113085\OneDrive - Cognizant\Desktop\Project_1\data\
├── sales_reports\
│   ├── 2023_sales.csv
│   └── 2024_sales.csv
├── customer_data\
│   ├── customers.csv
│   └── customer_segments.parquet
└── product_catalog\
    └── products.csv
```

## Next Steps

1. **Add your real data** to the `data/` directory
2. **Customize the application** for your specific needs
3. **Test filtering** with your actual data
4. **Set up regular backups** of important data

## Support

For issues:
1. Check the main README.md
2. Verify data file formats
3. Test with sample data first
4. Check browser console for JavaScript errors

---

**Your web-based data query tool is ready! 🚀**