import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from 'axios';

const HomePage = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/folders');
      if (response.data.success) {
        setFolders(response.data.folders);
      } else {
        setError(response.data.error || 'Failed to fetch folders');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderPath) => {
    const encodedPath = encodeURIComponent(folderPath);
    navigate(`/folder/${encodedPath}`);
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
        <Button variant="contained" onClick={fetchFolders}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Browse folders containing CSV and Parquet files. Click on a folder to explore its contents.
        </Typography>
        {folders.length > 0 && (
          <Chip 
            icon={<FolderIcon />} 
            label={`${folders.length} folder${folders.length !== 1 ? 's' : ''} found`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {folders.length === 0 ? (
        <Alert severity="info">
          No folders with data files found. Make sure you have CSV or Parquet files in your data directory.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {folders.map((folder, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleFolderClick(folder.folder_name)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FolderIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2" noWrap>
                      {folder.folder_name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InsertDriveFileIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {folder.file_count} file{folder.file_count !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Files:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {folder.files.slice(0, 3).map((file, fileIndex) => (
                        <Chip
                          key={fileIndex}
                          label={file}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                      {folder.files.length > 3 && (
                        <Chip
                          label={`+${folder.files.length - 3} more`}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderClick(folder.folder_name);
                    }}
                  >
                    Explore Folder
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage;