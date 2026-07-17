import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const fallbackArticles: any[] = [
  {
    id: 'mock-1',
    title: 'Comment bien démarrer avec Copilot Studio',
    summary: 'Tutoriel complet sur la création de votre premier agent conversationnel personnalisé sans ligne de code.',
    slug: 'creer-un-plan-microsoft-learn',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    media_type: 'video',
    published_at: new Date().toISOString(),
    blog_categories: { name: 'IA', slug: 'ia', color: '#10B981' },
  },
  {
    id: 'mock-2',
    title: 'Maîtriser le Prompt Engineering dans Microsoft Copilot',
    summary: 'Découvrez comment structurer vos requêtes pour obtenir des synthèses d\'architecture logicielle de haute volée.',
    slug: 'mon-premier-tutoriel-copilot',
    image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    media_type: 'video',
    published_at: new Date().toISOString(),
    blog_categories: { name: 'IA', slug: 'ia', color: '#10B981' },
  },
];

export function useBlogArticle(slug: string) {
  return useQuery({
    queryKey: ['blog_article', slug],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('article_list')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        return {
          ...data,
          blog_categories: (data as any)?.category || (data as any)?.blog_categories,
        };
      } catch (err) {
        const mock = fallbackArticles.find((a) => a.slug === slug);
        if (mock) return mock;
        throw err;
      }
    },
    enabled: !!slug,
  });
}
