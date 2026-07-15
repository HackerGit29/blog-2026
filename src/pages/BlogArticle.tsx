import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Chip, CircularProgress, Button, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useBlogArticle } from '../hooks/useBlogArticle';
import { BlogLayout } from '../components/blog/BlogLayout';
import { getEmbedUrl } from '../lib/videoUtils';
import { TutorialWorkspace } from '../components/blog/tutorials/TutorialWorkspace';
import { getTutorialEnhancement } from '../data/tutorialEnhancements';
import { MicrosoftBanners } from '../components/blog/MicrosoftBanners';
import { getMicrosoftTech } from '../lib/microsoft/content';
import { SEOHead, BlogPostingJsonLd } from '../components/SEOHead';
import { createSafeMarkup } from '../lib/sanitize';

export function BlogArticle() {
  const { slug, user } = useParams<{ slug: string; user: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useBlogArticle(slug || '');
  const article = data as any;
  const tech = getMicrosoftTech(article?.slug);
  const base = `/${user ?? 'admin'}`;

  if (isLoading) {
    return (
      <BlogLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </BlogLayout>
    );
  }

  if (error || !article) {
    return (
      <BlogLayout>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>Article non trouvé</Typography>
          <Button onClick={() => navigate(`${base}/blog`)} variant="contained" sx={{ mt: 2 }}>Retour au blog</Button>
        </Container>
      </BlogLayout>
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
  const enhancement = isVideoTutorial ? getTutorialEnhancement(article.slug) : null;

  const articleUrl = `https://benji-aka-dev.site${base}/blog/${article.slug}`;

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
      />
      <BlogPostingJsonLd
        title={article.title}
        description={article.summary || article.meta_description || ''}
        url={articleUrl}
        image={article.image_url || undefined}
        publishedAt={article.published_at || article.created_at}
      />
      <BlogLayout>
      <Container maxWidth={isVideoTutorial ? "lg" : "md"} sx={{ py: 4 }}>
        {/* Universal Back Navigation */}
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(isVideoTutorial ? `${base}/videos` : `${base}/blog`)}
          sx={{ mb: 4, color: 'text.secondary', fontWeight: 700 }}
        >
          {isVideoTutorial ? 'Retour aux tutoriels' : 'Retour au blog'}
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
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {article.blog_categories && (
                  <Chip 
                    label={article.blog_categories.name} 
                    sx={{ 
                      bgcolor: article.blog_categories.color || 'primary.main', 
                      color: '#fff',
                      fontWeight: 600
                    }} 
                  />
                )}
                {article.reading_time && (
                  <Chip label={`${article.reading_time} min de lecture`} variant="outlined" />
                )}
              </Box>

              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>
                {article.title}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, fontSize: '1.2rem', lineHeight: 1.6 }}>
                {article.summary}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box 
                  component="img" 
                  src="https://ui-avatars.com/api/?name=Benji&background=194943&color=fff" 
                  sx={{ width: 48, height: 48, borderRadius: '50%' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Benji</Typography>
                  <Typography variant="caption" color="text.secondary">{formattedDate}</Typography>
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
    </BlogLayout>
    </>
  );
}
