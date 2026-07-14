import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}
