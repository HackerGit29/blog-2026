import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Pagination, Skeleton, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useParams } from 'react-router-dom';
import { Header, ProfileSection, ProjectTabs } from '../components/portfolio';
import { CursorProvider, Cursor } from '../components/portfolio/AnimatedCursor';
import { usePortfolioStore } from '../store/portfolio';
import { useBlogArticles } from '../hooks/useBlogArticles';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { ArticleCard } from '../components/blog/ArticleCard';
import { BlogNewsletter } from '../components/blog/BlogNewsletter';
import { TutorialCard } from '../components/blog/tutorials/TutorialCard';
import { SEOHead, WebSiteJsonLd } from '../components/SEOHead';
import { RessourcesTab } from '../components/resources/RessourcesTab';
import { AProposTab } from '../components/about/AProposTab';

const tabs = ['blog', 'videos', 'ressources', 'apropos'];

export function PortfolioHome() {
  const { user } = useParams<{ user: string }>();
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const setActiveTab = usePortfolioStore((s) => s.setActiveTab);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);
  const touchStartX = useRef(0);
  const currentTab = tabs[activeTab] || 'blog';

  const tenantUsername = user || '';
  const { data: publicProfile } = usePublicProfile(tenantUsername);

  useEffect(() => {
    if (publicProfile) {
      updateProfile(publicProfile);
    }
  }, [publicProfile, updateProfile]);

  const profileOverride = publicProfile ?? undefined;
  const profileName = publicProfile?.name || tenantUsername;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && activeTab > 0) setActiveTab(activeTab - 1);
      else if (deltaX < 0 && activeTab < tabs.length - 1) setActiveTab(activeTab + 1);
    }
  };

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
          <Box onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} sx={{ touchAction: 'pan-y' }}>
            <TabContent tab={currentTab} username={tenantUsername} />
          </Box>
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
      return <BlogTab username={username} />;
    case 'videos':
      return <VideosTab username={username} />;
    case 'ressources':
      return <RessourcesTab username={username} />;
    case 'apropos':
      return <AProposTab username={username} />;
    default:
      return null;
  }
}

function BlogTab({ username }: { username?: string }) {
  const [page, setPage] = useState(1);
  const perPage = 9;

  const { data, isLoading } = useBlogArticles({ username, page, perPage, mediaFilter: 'image' });

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
        Articles
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

function VideosTab({ username }: { username?: string }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rawArticles, isLoading } = useBlogArticles({ username, mediaFilter: 'video' });

  const articles = rawArticles?.data || [];

  const filteredArticles = articles.filter((article: any) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
          Vidéos</Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <TextField
              size="small"
              placeholder="Rechercher par mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: '100%', maxWidth: { md: 360 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                  sx: { borderRadius: '12px' }
                }
              }}
            />
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
<Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>Aucune vidéo.</Typography>
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
              RECOMMANDATION DU GROUPE ÉTUDIANT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, mb: 2, letterSpacing: '-0.5px' }}>
              Prêt à faire valider tes compétences ?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 650, lineHeight: 1.6 }}>
              Explore les parcours conseillés à côté de ces tutoriels vidéo. Connecte-toi, suis les modules pratiques, et fais reconnaître tes acquis auprès de la communauté étudiante&nbsp;!
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
