import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FFE213' }, // Yellow accent
    secondary: { main: '#FF5A1F' },
    text: { 
      primary: '#FFFFFF', 
      secondary: '#A1A1AA' 
    },
    background: { 
      default: '#09090B', 
      paper: '#18181B' 
    },
    divider: '#27272A',
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.5rem' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2rem' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
    subtitle1: { fontWeight: 600, fontSize: '1.1rem' },
    body1: { fontSize: '1.05rem', lineHeight: 1.6 },
    body2: { fontSize: '0.95rem' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#FFE213',
          color: '#09090B', // Dark text on yellow background
          '&:hover': {
            backgroundColor: '#E6CC11',
          },
        },
        contained: {
          backgroundColor: '#FFFFFF',
          color: '#09090B',
          '&:hover': {
            backgroundColor: '#E4E4E7',
          },
        },
        outlined: {
          borderColor: '#27272A',
          color: '#FFFFFF',
          borderWidth: '1.5px',
          padding: '9px 24px', 
          '&:hover': {
            backgroundColor: '#18181B',
            borderColor: '#3F3F46',
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1.05rem',
          color: '#A1A1AA',
          minWidth: 0,
          padding: '16px 24px',
          marginRight: '8px',
          '&.Mui-selected': {
            color: '#FFE213',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#FFE213', // Yellow accent indicator
          height: '2px',
        },
        root: {
          borderBottom: '1px solid #27272A',
        }
      },
    },
  },
});

