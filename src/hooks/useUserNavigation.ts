import { useParams } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolio';

export function useUserNavigation() {
  const { user } = useParams<{ user: string }>();
  const profile = usePortfolioStore((s) => s.profile);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const currentUser = user || slugify(profile.name) || 'benji';

  const getBlogUrl = () => `/${currentUser}/blog`;
  const getArticleUrl = (slug: string) => `/${currentUser}/blog/${slug}`;
  const getVideoUrl = (slug: string) => `/${currentUser}/videos/${slug}`;

  return {
    user: currentUser,
    getBlogUrl,
    getArticleUrl,
    getVideoUrl,
  };
}
