import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Chip, CircularProgress, Button, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useBlogArticle } from '../hooks/useBlogArticle';
import { getEmbedUrl } from '../lib/videoUtils';
import { TutorialWorkspace } from '../components/blog/tutorials/TutorialWorkspace';
import { MicrosoftBanners } from '../components/blog/MicrosoftBanners';
import { getMicrosoftTech } from '../lib/microsoft/content';
import { SEOHead, BlogPostingJsonLd } from '../components/SEOHead';
import { createSafeMarkup } from '../lib/sanitize';
import { optimizedAvatar } from '../lib/optimizedUrl';

export function BlogArticle() {
  const { slug, user } = useParams<{ slug: string; user: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useBlogArticle(slug || '');
  const article = data as any;
  const tech = getMicrosoftTech(article?.slug);
  const base = `/${user ?? 'admin'}`;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12, minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Article non trouvé</Typography>
        <Button onClick={() => navigate(base)} variant="contained" sx={{ mt: 2 }}>Retour au profil</Button>
      </Container>
    );
  }

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('fr-FR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // HTML assaini via DOMPurify — protège contre les injections XSS

  const isVideoTutorial = article.media_type === 'video';
  const rawMeta = isVideoTutorial ? article.video_metadata : null;
  const enhancement = rawMeta && typeof rawMeta === 'object' ? rawMeta : null;

  const articleUrl = `https://benji-aka-dev.site${base}/blog/${article.slug}`;
  const articleAuthor = article?.author;

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.summary || article.meta_description || ''}
        canonical={articleUrl}
        image={article.image_url || undefined}
        type="article"
        publishedAt={article.published_at}
        tags={article.tags || []}
        author={articleAuthor?.name || undefined}
      />
      <BlogPostingJsonLd
        title={article.title}
        description={article.summary || article.meta_description || ''}
        url={articleUrl}
        image={article.image_url || undefined}
        publishedAt={article.published_at || article.created_at}
      />
      <Container maxWidth={isVideoTutorial ? "lg" : "md"} sx={{ py: 4, minHeight: '100vh' }}>
        {/* Universal Back Navigation */}
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(base)}
          sx={{ mb: 4, color: 'text.secondary', fontWeight: 700 }}
        >
          Retour au profil
        </Button>

        {isVideoTutorial && enhancement ? (
          /* Premium Interactive Training Workspace View */
          <Box>
            <TutorialWorkspace 
              videoUrl={article.video_url || undefined} 
              imageUrl={article.image_url || undefined} 
              title={article.title} 
              enhancement={enhancement} 
            />
          </Box>
        ) : (
          /* Elegant Written Editorial Article View */
          <Box>
            <Box sx={{ mb: 6 }}>

              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>
                {article.title}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, fontSize: '1.2rem', lineHeight: 1.6 }}>
                {article.summary}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box 
                  component="img" 
                  src={optimizedAvatar(articleAuthor?.avatar_url || '', 96) || `https://ui-avatars.com/api/?name=${encodeURIComponent(articleAuthor?.name || '')}&background=194943&color=fff`} 
                  alt={articleAuthor?.name}
                  loading="lazy"
                  sx={{ width: 48, height: 48, borderRadius: '50%' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{articleAuthor?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {article.image_url && (
              <Box 
                component="img" 
                src={article.image_url} 
                sx={{ width: '100%', maxHeight: 600, objectFit: 'cover', borderRadius: '20px', border: '1px solid #1A1A1A', mb: 6 }}
              />
            )}

            <Box 
              className="markdown-body" 
              dangerouslySetInnerHTML={createSafeMarkup(article.content || '')}
              sx={{ 
                fontSize: '1.125rem', 
                color: 'text.primary',
                '& h2': { mt: 6, mb: 3 },
                '& h3': { mt: 4, mb: 2 },
                '& p': { mb: 3, lineHeight: 1.8 }
              }}
            />

            {tech && <MicrosoftBanners />}

            <Divider sx={{ my: 6 }} />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {article.tags.map((tag: string) => (
                  <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  );
}
