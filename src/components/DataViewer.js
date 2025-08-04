import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const DataViewer = () => {
  const { folderPath, fileName } = useParams();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [filteredRows, setFilteredRows] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [downloading, setDownloading] = useState(false);

  const decodedFolderPath = decodeURIComponent(folderPath);
  const decodedFileName = decodeURIComponent(fileName);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/preview', {
        file_path: filePath,
        filters: filters,
        page: page + 1,
        page_size: rowsPerPage
      });

      if (response.data.success) {
        setData(response.data.data);
        setColumns(response.data.columns);
        setTotalRows(response.data.total_rows);
        setFilteredRows(response.data.filtered_rows);
        setError(null);
      } else {
        setError(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [filePath, filters, page, rowsPerPage]);

  useEffect(() => {
    // Construct file path
    const constructedPath = decodedFolderPath === 'root' 
      ? `./data/${decodedFileName}`
      : `./data/${decodedFolderPath}/${decodedFileName}`;
    setFilePath(constructedPath);
  }, [decodedFolderPath, decodedFileName]);

  useEffect(() => {
    if (filePath) {
      fetchData();
    }
  }, [fetchData, filePath]);

  const handleFilterChange = (column, value) => {
    const newFilters = { ...filters };
    if (value.trim() === '') {
      delete newFilters[column];
    } else {
      newFilters[column] = value;
    }
    setFilters(newFilters);
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await axios.post('/api/download', {
        file_path: filePath,
        filters: filters
      }, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${decodedFileName}_filtered.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloading(false);
    }
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) {
      return <em style={{ color: '#999' }}>null</em>;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (loading && data.length === 0) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {decodedFileName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Viewing data from: {decodedFolderPath}/{decodedFileName}
        </Typography>
        
        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={`${totalRows.toLocaleString()} total rows`} 
            color="primary" 
            variant="outlined" 
          />
          {hasActiveFilters && (
            <Chip 
              label={`${filteredRows.toLocaleString()} filtered rows`} 
              color="secondary" 
              variant="outlined" 
            />
          )}
          <Chip 
            label={`${columns.length} columns`} 
            color="default" 
            variant="outlined" 
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download Filtered Data'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters Panel */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            <Typography variant="h6">
              Column Filters {hasActiveFilters && `(${Object.keys(filters).length} active)`}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid item xs={12} sm={6} md={4} key={column.name}>
                <TextField
                  fullWidth
                  label={`Filter ${column.name}`}
                  variant="outlined"
                  size="small"
                  value={filters[column.name] || ''}
                  onChange={(e) => handleFilterChange(column.name, e.target.value)}
                  helperText={`${column.type} | ${column.unique_values} unique | ${column.null_count} nulls`}
                  InputProps={{
                    endAdornment: filters[column.name] && (
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange(column.name, '')}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Data Table */}
      <Paper elevation={1}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.name}
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      minWidth: 120
                    }}
                  >
                    <Box>
                      <Typography variant="body2" noWrap>
                        {column.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {column.type}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                    No data matches your filters
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index} hover>
                    {columns.map((column) => (
                      <TableCell key={column.name}>
                        {renderCellValue(row[column.name])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default DataViewer;