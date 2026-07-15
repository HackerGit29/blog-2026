import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { create } from 'zustand';

// Zustand store for UI preferences (theme)
interface UIState {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'dark',
  toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const mode = useUIStore((state) => state.mode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#234940' : '#FFE213', // Deep green in light mode, yellow in dark mode
          },
          secondary: {
            main: '#ECE7DB', // Unified card beige background
          },
          background: {
            default: mode === 'light' ? '#F9F8F4' : '#121212',
            paper: mode === 'light' ? '#ECE7DB' : '#1E1E1E',
          },
          text: {
            primary: mode === 'light' ? '#1A1A1A' : '#F5F5F5',
            secondary: mode === 'light' ? '#666666' : '#AAAAAA',
          },
        },
        typography: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 800 },
          h2: { fontWeight: 800 },
          h3: { fontWeight: 800 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
          borderRadius: 24,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '32px',
                padding: '10px 28px',
                fontWeight: 700,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
              },
              contained: {
                boxShadow: 'none',
                backgroundColor: mode === 'light' ? '#1A1A1A' : '#FFE213',
                color: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: mode === 'light' ? '#333333' : '#E6CB11',
                }
              },
              containedPrimary: {
                boxShadow: 'none',
                backgroundColor: mode === 'light' ? '#234940' : '#FFE213',
                color: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: mode === 'light' ? '#1C3E36' : '#E6CB11',
                }
              },
              outlined: {
                borderColor: mode === 'light' ? '#1A1A1A' : '#FFE213',
                color: mode === 'light' ? '#1A1A1A' : '#FFE213',
                '&:hover': {
                  borderColor: mode === 'light' ? '#1A1A1A' : '#FFE213',
                  backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 226, 19, 0.08)',
                }
              },
              outlinedPrimary: {
                borderColor: mode === 'light' ? '#234940' : '#FFE213',
                color: mode === 'light' ? '#234940' : '#FFE213',
                '&:hover': {
                  borderColor: mode === 'light' ? '#1C3E36' : '#E6CB11',
                  backgroundColor: mode === 'light' ? 'rgba(35, 73, 64, 0.08)' : 'rgba(255, 226, 19, 0.08)',
                }
              }
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' ? 'none' : '0 4px 20px rgba(0,0,0,0.4)',
                borderRadius: '24px',
                backgroundColor: mode === 'light' ? '#ECE7DB' : '#1E1E1E',
                border: '1px solid',
                borderColor: mode === 'light' ? '#1A1A1A' : 'rgba(255, 255, 255, 0.12)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: mode === 'light' ? '0 10px 25px rgba(0,0,0,0.08)' : '0 8px 30px rgba(0,0,0,0.6)',
                  borderColor: mode === 'light' ? '#1A1A1A' : 'rgba(255, 255, 255, 0.24)',
                }
              }
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '24px',
                fontWeight: 600,
              },
              outlined: {
                borderColor: mode === 'light' ? '#1A1A1A' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: mode === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
              }
            }
          }
        },
      }),
    [mode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <HelmetProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
