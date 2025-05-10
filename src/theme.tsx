import { createTheme } from '@mui/material/styles';

// Create a custom theme with modern, startup-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee', // Vibrant blue
      light: '#738eef',
      dark: '#2f3eb1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7209b7', // Rich purple
      light: '#9b4dca',
      dark: '#4c0677',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    error: {
      main: '#ef476f',
    },
    warning: {
      main: '#ffd166',
    },
    info: {
      main: '#118ab2',
    },
    success: {
      main: '#06d6a0',
    },
    text: {
      primary: '#2b2d42',
      secondary: '#575a7b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 16px 24px rgba(0, 0, 0, 0.05)',
    '0px 24px 32px rgba(0, 0, 0, 0.05)',
    '0px 32px 40px rgba(0, 0, 0, 0.05)',
    '0px 40px 48px rgba(0, 0, 0, 0.05)',
    '0px 48px 56px rgba(0, 0, 0, 0.05)',
    '0px 56px 64px rgba(0, 0, 0, 0.05)',
    '0px 64px 72px rgba(0, 0, 0, 0.05)',
    '0px 72px 80px rgba(0, 0, 0, 0.05)',
    '0px 80px 88px rgba(0, 0, 0, 0.05)',
    '0px 88px 96px rgba(0, 0, 0, 0.05)',
    '0px 96px 104px rgba(0, 0, 0, 0.05)',
    '0px 104px 112px rgba(0, 0, 0, 0.05)',
    '0px 112px 120px rgba(0, 0, 0, 0.05)',
    '0px 120px 128px rgba(0, 0, 0, 0.05)',
    '0px 128px 136px rgba(0, 0, 0, 0.05)',
    '0px 136px 144px rgba(0, 0, 0, 0.05)',
    '0px 144px 152px rgba(0, 0, 0, 0.05)',
    '0px 152px 160px rgba(0, 0, 0, 0.05)',
    '0px 160px 168px rgba(0, 0, 0, 0.05)',
    '0px 168px 176px rgba(0, 0, 0, 0.05)',
    '0px 176px 184px rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4361ee 30%, #3a56d4 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #7209b7 30%, #6a0dad 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          backgroundImage: 'linear-gradient(90deg, #4361ee 0%, #3a56d4 100%)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;