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
  }
}

export function TurnstileWidget({ onVerify, reset }: TurnstileWidgetProps) {
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const id = 'turnstile-container-' + Math.random().toString(36).slice(2);
    if (containerRef.current) {
      containerRef.current.id = id;

      const render = () => {
        if (widgetRef.current) {
          window.turnstile?.remove(widgetRef.current);
        }
        widgetRef.current = window.turnstile?.render(id, {
          sitekey: (import.meta as any).env.VITE_TURNSTILE_SITEKEY,
          callback: onVerify,
          theme: isDark ? 'dark' : 'light',
        }) ?? null;
      };

      if (window.turnstile) {
        render();
      } else {
        const check = setInterval(() => {
          if (window.turnstile) {
            clearInterval(check);
            render();
          }
        }, 100);
        return () => clearInterval(check);
      }
    }
  }, [isDark]);

  useEffect(() => {
    if (reset && widgetRef.current) {
      window.turnstile?.reset(widgetRef.current);
    }
  }, [reset]);

  return <Box ref={containerRef} sx={{ mb: 1 }} />;
}
