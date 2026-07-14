import { useMutation } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'blog' } as any);
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Vous êtes déjà inscrit à la newsletter.');
        }
        throw new Error("Une erreur est survenue lors de l'inscription.");
      }
      return data;
    },
  });
}
