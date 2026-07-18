import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface UseBlogArticlesOptions {
  username?: string;
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

async function fetchViaApi(options?: UseBlogArticlesOptions): Promise<ArticlesResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.perPage) params.set('per_page', String(options.perPage));
  if (options?.username) params.set('username', options.username);
  if (options?.search) params.set('search', options.search);
  if (options?.categoryId && options.categoryId !== 'all') params.set('category_id', options.categoryId);
  if (options?.mediaFilter && options.mediaFilter !== 'all') params.set('media_type', options.mediaFilter);

  const res = await fetch(`/api/articles?${params.toString()}`);
  if (!res.ok) throw new Error('API error');
  const result: ArticlesResponse = await res.json();

  if (result.data) {
    result.data = result.data.map((article: any) => ({
      ...article,
      blog_categories: article.blog_categories || article.category,
    }));
  }
  return result;
}

async function fetchDirect(options?: UseBlogArticlesOptions): Promise<ArticlesResponse> {
  let query = supabase
    .from('article_list')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false });

  if (options?.username) {
    query = query.eq('author->>username', options.username);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`);
  }
  if (options?.categoryId && options.categoryId !== 'all') {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.mediaFilter && options.mediaFilter !== 'all') {
    if (options.mediaFilter === 'video') {
      query = query.eq('media_type', 'video');
    } else if (options.mediaFilter === 'image') {
      query = query.or('media_type.eq.image,media_type.is.null');
    }
  }

  const page = options?.page || 1;
  const perPage = options?.perPage || 9;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, count } = await query;

  const mapped = (data || []).map((article: any) => ({
    ...article,
    blog_categories: article.category || article.blog_categories,
  }));

  return {
    data: mapped,
    total: count || 0,
    total_all: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
    category_counts: {},
  };
}

export function useBlogArticles(options?: UseBlogArticlesOptions) {
  return useQuery({
    queryKey: ['blog_articles', options],
    queryFn: async (): Promise<ArticlesResponse> => {
      try {
        return await fetchViaApi(options);
      } catch {
        return fetchDirect(options);
      }
    },
  });
}
