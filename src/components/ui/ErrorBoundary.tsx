import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Chip, alpha } from '@mui/material';

// ── Fallback UI ──────────────────────────────────────────────────────────────

interface FallbackProps {
  error: Error | null;
  resetError: () => void;
  componentName?: string;
}

/**
 * Composant d'affichage d'erreur — aligné sur le design system du projet.
 * Utilise les tokens MUI : palette primary, background, border-radius, typographie.
 */
function ErrorFallback({ error, resetError, componentName }: FallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: componentName ? 'auto' : '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        py: componentName ? 6 : 10,
        px: 3,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 226, 19, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}
      >
        {componentName ? `Erreur dans ${componentName}` : "Quelque chose s'est mal passé"}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', mb: 3, maxWidth: 420 }}
      >
        {componentName
          ? "Ce composant a rencontré une erreur inattendue. Le reste de la page fonctionne normalement."
          : "Une erreur inattendue a interrompu l'application. Vous pouvez réessayer ou revenir à l'accueil."}
      </Typography>

      {/* Error details in dev mode */}
      {isDev && error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            maxWidth: 600,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <Chip
            label="DEV"
            size="small"
            color="warning"
            sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.65rem' }}
          />
          <Typography
            variant="caption"
            component="pre"
            sx={{
              display: 'block',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: '0.75rem',
              color: 'error.main',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {error.name}: {error.message}
            {error.stack && `\n\n${error.stack.split('\n').slice(1, 5).join('\n')}`}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={resetError}
          sx={{ minWidth: 160 }}
        >
          Réessayer
        </Button>
        {!componentName && (
          <Button
            variant="outlined"
            onClick={() => {
              resetError();
              window.location.href = '/';
            }}
            sx={{ minWidth: 160 }}
          >
            Accueil
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Error Boundary Class Component ───────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Nom du composant affiché dans le message d'erreur (mode local) */
  componentName?: string;
  /** Fallback custom — si fourni, remplace le FallbackUI par défaut */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — React class component.
 *
 * Usage global (App.tsx) :
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Usage local (composant isolé) :
 *   <ErrorBoundary componentName="ArticleList">
 *     <ArticleList />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; replace with a real logger (Sentry, Datadog) in prod
    if (import.meta.env.DEV) {
      console.group('[ErrorBoundary]');
      console.error('Erreur capturée:', error);
      console.error('Component stack:', info.componentStack);
      console.groupEnd();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}
