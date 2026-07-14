import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface UseBlogArticlesOptions {
  search?: string;
  categoryId?: string;
  mediaFilter?: 'all' | 'image' | 'video';
  limit?: number;
}

export function useBlogArticles(options?: UseBlogArticlesOptions) {
  return useQuery({
    queryKey: ['blog_articles', options],
    queryFn: async () => {
      let query = supabase
        .from('admin_articles')
        .select('*, blog_categories(name, slug, color)')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`);
      }

      if (options?.categoryId && options.categoryId !== 'all') {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.mediaFilter === 'video') {
        query = query.eq('media_type', 'video');
      } else if (options?.mediaFilter === 'image') {
        query = query.or('media_type.eq.image,media_type.is.null');
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}
