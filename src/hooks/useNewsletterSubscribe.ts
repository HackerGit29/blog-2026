import { useMutation } from '@tanstack/react-query';

interface SubscribeInput {
  email: string;
  turnstileToken: string;
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async ({ email, turnstileToken }: SubscribeInput) => {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      return data;
    },
  });
}
