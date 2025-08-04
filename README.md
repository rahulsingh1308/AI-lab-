# Data Explorer

A modern web-based application for querying, filtering, and downloading data from CSV and Parquet files stored in local folders.

## Features

- 🗂️ **Folder Browsing**: Automatically scans and displays folders containing CSV and Parquet files
- 📊 **Data Visualization**: Clean, responsive table view with column information
- 🔍 **Advanced Filtering**: Apply filters on any column with real-time results
- 📄 **Pagination**: Efficient data loading with customizable page sizes
- ⬇️ **Download**: Export filtered data as CSV files
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance**: Optimized for large datasets with server-side processing

## Technology Stack

### Backend
- **Flask** - Python web framework
- **Pandas** - Data manipulation and analysis
- **PyArrow** - Parquet file support
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - User interface library
- **Material-UI** - Modern component library
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## Project Structure

```
├── backend/
│   └── app.py              # Flask backend application
├── src/
│   ├── components/
│   │   ├── HomePage.js     # Home page with folder listing
│   │   ├── FileExplorer.js # File browser for folders
│   │   ├── DataViewer.js   # Main data viewing component
│   │   └── Navigation.js   # Navigation breadcrumbs
│   ├── App.js             # Main React application
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── public/
│   └── index.html         # HTML template
├── data/                  # Directory for data files (auto-created)
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd data-explorer
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set data directory (optional, defaults to ./data)
export DATA_ROOT_PATH=/path/to/your/data/directory
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
npm install
```

### 4. Prepare Data Directory
```bash
# Create data directory and add your CSV/Parquet files
mkdir -p data
# Add your data files to the data directory or subdirectories
# Example structure:
# data/
# ├── sales/
# │   ├── 2023_sales.csv
# │   └── 2024_sales.parquet
# ├── customers/
# │   └── customer_data.csv
# └── products.csv
```

## Running the Application

### Development Mode

1. **Start the Backend** (in one terminal):
```bash
cd backend
python app.py
```
The backend will run on `http://localhost:5000`

2. **Start the Frontend** (in another terminal):
```bash
npm start
```
The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the Frontend**:
```bash
npm run build
```

2. **Run with Production Server**:
```bash
# Using gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Usage

1. **Browse Folders**: The home page displays all folders containing CSV or Parquet files
2. **Select Folder**: Click on a folder to view its files
3. **View Data**: Click on a file to open the data viewer
4. **Apply Filters**: Use the filter panel to filter data by any column
5. **Download Data**: Click the download button to export filtered data as CSV

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/folders` - Get all folders with data files
- `GET /api/files/<folder_path>` - Get files in a specific folder
- `POST /api/preview` - Preview file data with filtering and pagination
- `POST /api/download` - Download filtered data as CSV

## Configuration

### Environment Variables

- `DATA_ROOT_PATH` - Path to the directory containing data files (default: `./data`)

### Data File Support

- **CSV files**: `.csv` extension
- **Parquet files**: `.parquet` extension

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check if all Python dependencies are installed
2. **Frontend build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. **No data showing**: Ensure your data files are in the correct directory and have supported extensions
4. **CORS errors**: Make sure the backend is running and CORS is properly configured

### Performance Tips

- For large files, consider using Parquet format for better performance
- Use appropriate page sizes for your data size
- Apply filters to reduce data transfer

## Support

For issues and questions, please create an issue in the repository or contact the development team.