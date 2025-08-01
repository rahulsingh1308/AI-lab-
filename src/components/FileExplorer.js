import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import axios from 'axios';

const FileExplorer = () => {
  const { folderPath } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, [folderPath]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/${encodeURIComponent(folderPath)}`);
      if (response.data.success) {
        setFiles(response.data.files);
      } else {
        setError(response.data.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case '.csv':
        return <DescriptionIcon color="success" />;
      case '.parquet':
        return <TableChartIcon color="primary" />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const handleFileClick = (file) => {
    const encodedFolderPath = encodeURIComponent(folderPath);
    const encodedFileName = encodeURIComponent(file.name);
    navigate(`/data/${encodedFolderPath}/${encodedFileName}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Files in "{decodeURIComponent(folderPath)}"
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Click on a file to view and filter its data.
        </Typography>
        {files.length > 0 && (
          <Chip 
            icon={<InsertDriveFileIcon />} 
            label={`${files.length} file${files.length !== 1 ? 's' : ''} found`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {files.length === 0 ? (
        <Alert severity="info">
          No data files found in this folder.
        </Alert>
      ) : (
        <Paper elevation={1}>
          <List>
            {files.map((file, index) => (
              <React.Fragment key={file.name}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleFileClick(file)}>
                    <ListItemIcon>
                      {getFileIcon(file.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" component="span">
                            {file.name}
                          </Typography>
                          <Chip
                            label={file.type.toUpperCase().substring(1)}
                            size="small"
                            color={file.type === '.csv' ? 'success' : 'primary'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Size: {formatFileSize(file.size)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Modified: {formatDate(file.modified)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < files.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default FileExplorer;