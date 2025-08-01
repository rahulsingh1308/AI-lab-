import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'Home', path: '/', icon: <HomeIcon /> }
    ];

    if (segments.length > 1) {
      if (segments[0] === 'folder') {
        const folderPath = decodeURIComponent(segments[1]);
        breadcrumbs.push({
          label: folderPath,
          path: `/folder/${segments[1]}`,
          icon: <FolderIcon />
        });
      }
      
      if (segments.length > 3 && segments[0] === 'data') {
        const fileName = decodeURIComponent(segments[2]);
        breadcrumbs.push({
          label: fileName,
          path: location.pathname,
          icon: <InsertDriveFileIcon />
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Data Explorer
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <Typography sx={{ mx: 1 }}>/</Typography>}
              <Button
                color="inherit"
                startIcon={crumb.icon}
                onClick={() => navigate(crumb.path)}
                sx={{ 
                  textTransform: 'none',
                  opacity: index === breadcrumbs.length - 1 ? 1 : 0.7
                }}
              >
                {crumb.label}
              </Button>
            </React.Fragment>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;