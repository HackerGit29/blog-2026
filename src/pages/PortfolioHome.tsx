import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Pagination, Chip, Skeleton, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useParams } from 'react-router-dom';
import { Header, ProfileSection, ProjectTabs } from '../components/portfolio';
import { CursorProvider, Cursor } from '../components/portfolio/AnimatedCursor';
import { usePortfolioStore, DEFAULT_TENANT } from '../store/portfolio';
import { useBlogArticles } from '../hooks/useBlogArticles';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { ArticleCard } from '../components/blog/ArticleCard';
import { BlogNewsletter } from '../components/blog/BlogNewsletter';
import { TutorialCard } from '../components/blog/tutorials/TutorialCard';
import { getTutorialEnhancement } from '../data/tutorialEnhancements';
import { SEOHead, WebSiteJsonLd } from '../components/SEOHead';
import { RessourcesTab } from '../components/resources/RessourcesTab';
import { AProposTab } from '../components/about/AProposTab';


const tabs = ['blog', 'videos', 'ressources', 'apropos'];

export function PortfolioHome() {
  const { user } = useParams<{ user: string }>();
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);
  const currentTab = tabs[activeTab] || 'blog';

  // Le tenant à afficher : param URL ou tenant par défaut
  const tenantUsername = user || DEFAULT_TENANT;

  // Charge le profil public du tenant depuis Supabase
  const { data: publicProfile } = usePublicProfile(tenantUsername);

  // Synchronise le profil du tenant visité dans le store (cache offline)
  // Séparé de ownProfile (user auth) — pas de collision
  React.useEffect(() => {
    if (publicProfile) {
      updateProfile(publicProfile);
    }
  }, [publicProfile]);

  const profileOverride = publicProfile ?? undefined;
  const profileName = publicProfile?.name || 'Benji';

  return (
    <>
      <SEOHead
        title={profileName}
        description="Blog sur l'IA, Microsoft Learn, Power Platform, Cloud, DevOps et développement web. Tutoriels, articles techniques et ressources."
      />
      <WebSiteJsonLd />
      <CursorProvider>
        <Cursor />
        <Box component="main" sx={{ position: 'relative', minHeight: '100vh', pb: 10, overflowX: 'hidden' }}>
        <div className="page-bg-gradient" />
        <Container maxWidth="xl" sx={{ pt: 2, px: { xs: 3, md: 8 } }}>
          <Header />
          <ProfileSection profileOverride={profileOverride} />
          <ProjectTabs />
          <TabContent tab={currentTab} username={tenantUsername} />
          <Box sx={{ mt: 8 }}>
            <BlogNewsletter />
          </Box>
      </Container>
    </Box>
  </CursorProvider>
    </>
  );
}

function TabContent({ tab, username }: { tab: string; username?: string }) {
  switch (tab) {
    case 'blog':
      return <BlogTab />;
    case 'videos':
      return <VideosTab />;
    case 'ressources':
      return <RessourcesTab username={username} />;
    case 'apropos':
      return <AProposTab username={username} />;
    default:
      return null;
  }
}

function BlogTab() {
  const [page, setPage] = useState(1);
  const perPage = 9;

  const { data, isLoading } = useBlogArticles({ page, perPage });

  const articles = data?.data || [];
  const totalPages = data?.total_pages || 1;

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>Chargement...</Typography>;
  }

  if (articles.length === 0) {
    return <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>Aucun article publié pour le moment.</Typography>;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
        Tous nos articles techniques et ressources
      </Typography>
      <Grid container spacing={3}>
        {articles.map((article: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id} sx={{ display: 'flex' }}>
            <ArticleCard article={article} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" />
        </Box>
      )}
    </Box>
  );
}

function VideosTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: rawArticles, isLoading } = useBlogArticles({ mediaFilter: 'video' });

  const fallbackArticles = [
    {
      id: 'mock-1',
      title: 'Comment bien démarrer avec Copilot Studio',
      summary: 'Tutoriel complet sur la creation de votre premier agent conversationnel personnalise sans ligne de code.',
      slug: 'creer-un-plan-microsoft-learn',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      media_type: 'video',
      published_at: new Date().toISOString(),
      blog_categories: { name: 'IA', slug: 'ia', color: '#10B981' }
    },
    {
      id: 'mock-2',
      title: 'Maitriser le Prompt Engineering dans Microsoft Copilot',
      summary: 'Decouvrez comment structurer vos requetes pour obtenir des syntheses d\'architecture logicielle de haute volee.',
      slug: 'mon-premier-tutoriel-copilot',
      image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      media_type: 'video',
      published_at: new Date().toISOString(),
      blog_categories: { name: 'IA', slug: 'ia', color: '#10B981' }
    }
  ];

  const articles = rawArticles?.data && rawArticles.data.length > 0 ? rawArticles.data : fallbackArticles;

  const filteredArticles = articles.filter((article: any) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const enhancement = getTutorialEnhancement(article.slug);
    const matchesLevel = selectedLevel === 'all' || enhancement.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 850, mb: 3 }}>Tous les modules de formation</Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth size="small"
              placeholder="Rechercher par mot-cle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                  sx: { borderRadius: '12px' }
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: { md: 'flex-end' }, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mr: 1, color: 'text.secondary' }}>Niveau :</Typography>
            {['all', 'Debutant', 'Intermediaire', 'Avance'].map((level) => (
              <Chip
                key={level}
                label={level === 'all' ? 'Tous' : level}
                onClick={() => setSelectedLevel(level)}
                color={selectedLevel === level ? 'primary' : 'default'}
                sx={{ fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              />
            ))}
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '16px', mb: 2 }} />
              <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
              <Skeleton width="80%" height={32} sx={{ mb: 1 }} />
              <Skeleton width="60%" height={20} />
            </Grid>
          ))}
        </Grid>
      ) : filteredArticles.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '16px', border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Aucun module trouve</Typography>
          <Typography variant="body2" color="text.secondary">Essayez de modifier vos filtres de recherche ou selectionnez une autre categorie.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3.5}>
          {filteredArticles.map((article: any, index: number) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id} sx={{ display: 'flex' }}>
              <TutorialCard article={article} index={index} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 8, p: { xs: 4, md: 6 }, bgcolor: 'action.hover', borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              RECOMMANDATION DU GROUPE ETUDIANT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, mb: 2, letterSpacing: '-0.5px' }}>
              Pret a faire valider tes competences ?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 650, lineHeight: 1.6 }}>
              Suis nos plans Microsoft Learn recommandes a cote de ces tutoriels video. Connecte-toi, demarre le plan, termine les modules pratiques, et partage ta reussite avec l'ambassadeur !
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box component="img"
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80"
              alt="Student Community Learn"
              sx={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
