import React from 'react';
import { Box, Stack, Typography, Grid } from '@mui/material';
import { useBlogArticles } from '../../hooks/useBlogArticles';
import { useNavigate } from 'react-router-dom';

function ArticleCard({ article }: { article: any }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/blog/${article.slug}`)}
      sx={{ cursor: 'pointer', '&:hover .img-container': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(0,0,0,0.06)' } }}
    >
      <Box
        className="img-container"
        sx={{
          position: 'relative',
          borderRadius: '32px',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          aspectRatio: '4/3',
          mb: 2.5,
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }}
          />
        ) : (
          <Typography sx={{ color: 'text.disabled', fontSize: '3rem', fontWeight: 700 }}>
            {article.title?.[0]?.toUpperCase()}
          </Typography>
        )}
      </Box>

      <Stack sx={{ px: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary', mb: 0.25, fontSize: '1.15rem' }}>
          {article.title}
        </Typography>
        {article.summary && (
          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {article.summary}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function ProjectGrid() {
  const { data, isLoading } = useBlogArticles({ perPage: 12 });

  if (isLoading) {
    return (
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>
        Chargement...
      </Typography>
    );
  }

  const articles = data?.data || [];

  if (articles.length === 0) {
    return (
      <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>
        Aucun article publié pour le moment.
      </Typography>
    );
  }

  return (
    <Grid container spacing={4}>
      {articles.map((article: any) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
          <ArticleCard article={article} />
        </Grid>
      ))}
    </Grid>
  );
}
