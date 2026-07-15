import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { theme } from './theme';
import { PortfolioPage } from './pages/PortfolioPage';
import { CursorProvider, Cursor, CursorFollow } from './components/AnimatedCursor';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CursorProvider global={false}>
          <Cursor />
          <CursorFollow>
            <Box sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              letterSpacing: '0.5px'
            }}>
              Designer
            </Box>
          </CursorFollow>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PortfolioPage />} />
            </Routes>
          </BrowserRouter>
        </CursorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
