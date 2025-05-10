import React from 'react';
import { Box, Grid, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageGridProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  spacing?: number;
  fullWidth?: boolean;
}

const PageGrid: React.FC<PageGridProps> = ({
  title,
  description,
  breadcrumbs,
  children,
  spacing = 3,
  fullWidth = false
}) => {
  const theme = useTheme();
  
  return (
    <Box>
      {(title || breadcrumbs) && (
        <Box sx={{ mb: 3 }}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />} 
              sx={{ mb: 1 }}
            >
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast || !item.path ? (
                  <Typography key={index} color="text.primary" variant="body2">
                    {item.label}
                  </Typography>
                ) : (
                  <Link 
                    key={index} 
                    component={RouterLink} 
                    to={item.path} 
                    color="inherit"
                    underline="hover"
                    variant="body2"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}
          
          {title && (
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: description ? 1 : 0
              }}
            >
              {title}
            </Typography>
          )}
          
          {description && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: '800px' }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}
      
      <Grid container spacing={spacing} sx={{ width: fullWidth ? '100%' : 'auto' }}>
        {children}
      </Grid>
    </Box>
  );
};

export default PageGrid;