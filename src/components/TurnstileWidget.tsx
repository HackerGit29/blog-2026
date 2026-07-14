import { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  reset?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    turnstileCallbacks?: Array<() => void>;
  }
}

const CONTAINER_ID = 'turnstile-container';

export function TurnstileWidget({ onVerify, reset }: TurnstileWidgetProps) {
  const widgetRef = useRef<string | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const renderWidget = () => {
      const el = document.getElementById(CONTAINER_ID);
      if (!el || !window.turnstile) return false;
      if (widgetRef.current) {
        window.turnstile.remove(widgetRef.current);
      }
      widgetRef.current = window.turnstile.render(CONTAINER_ID, {
        sitekey: (import.meta as any).env.VITE_TURNSTILE_SITEKEY,
        callback: onVerify,
        theme: isDark ? 'dark' : 'light',
      });
      return true;
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      window.turnstileCallbacks = window.turnstileCallbacks || [];
      window.turnstileCallbacks.push(renderWidget);
    }

    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (reset && widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  }, [reset]);

  return <Box id={CONTAINER_ID} sx={{ mb: 1 }} />;
}
