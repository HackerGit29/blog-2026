import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useBlogArticle(slug: string) {
  return useQuery({
    queryKey: ['blog_article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_articles')
        .select('*, blog_categories(name, slug, color)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
