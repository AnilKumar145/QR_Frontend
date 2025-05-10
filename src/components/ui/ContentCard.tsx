import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  useTheme, 
  CardProps,
  SxProps,
  Theme
} from '@mui/material';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  elevation?: number;
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  cardProps?: Omit<CardProps, 'elevation' | 'sx'>;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  action,
  elevation = 0,
  sx = {},
  headerSx = {},
  cardProps
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={elevation} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'visible',
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
      {...cardProps}
    >
      {title && (
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box sx={{ mr: 1.5, color: theme.palette.primary.main }}>
                  {icon}
                </Box>
              )}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
          }
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={action}
          sx={{ 
            pb: 0,
            '& .MuiCardHeader-action': { m: 0 },
            ...headerSx
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, pt: title ? 1 : 2 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ContentCard;

