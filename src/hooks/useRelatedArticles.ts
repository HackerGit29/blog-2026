import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useRelatedArticles(categoryId?: string | null, currentArticleId?: string) {
  return useQuery({
    queryKey: ['related_articles', categoryId, currentArticleId],
    queryFn: async () => {
      if (!categoryId) return [];

      let query = supabase
        .from('admin_articles')
        .select('id, title, slug, summary, image_url, content, tags, media_type, published_at, blog_categories(id, name, color)')
        .eq('category_id', categoryId)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (currentArticleId) {
        query = query.neq('id', currentArticleId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
}
