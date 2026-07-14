import { useQuery } from '@tanstack/react-query';

export interface UseBlogArticlesOptions {
  search?: string;
  categoryId?: string;
  mediaFilter?: 'all' | 'image' | 'video';
  page?: number;
  perPage?: number;
}

export interface ArticlesResponse {
  data: any[];
  total: number;
  total_all: number;
  page: number;
  per_page: number;
  total_pages: number;
  category_counts: Record<string, number>;
}

export function useBlogArticles(options?: UseBlogArticlesOptions) {
  return useQuery({
    queryKey: ['blog_articles', options],
    queryFn: async (): Promise<ArticlesResponse> => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', String(options.page));
      if (options?.perPage) params.set('per_page', String(options.perPage));
      if (options?.search) params.set('search', options.search);
      if (options?.categoryId && options.categoryId !== 'all') params.set('category_id', options.categoryId);
      if (options?.mediaFilter && options.mediaFilter !== 'all') params.set('media_type', options.mediaFilter);

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des articles');
      return res.json();
    },
  });
}
