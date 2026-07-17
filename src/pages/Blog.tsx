import React, { useState } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Button, Pagination } from '@mui/material';
import { BlogLayout } from '../components/blog/BlogLayout';
import { ArticleCard } from '../components/blog/ArticleCard';
import { HighlightedArticleCard } from '../components/blog/HighlightedArticleCard';
import { RecentStoryCard } from '../components/blog/RecentStoryCard';
import { ArticleListItem } from '../components/blog/ArticleListItem';
import { BlogCategoriesWidget } from '../components/blog/BlogCategoriesWidget';
import { BlogSearchFilters } from '../components/blog/BlogSearchFilters';
import { BlogNewsletter } from '../components/blog/BlogNewsletter';
import { useBlogArticles } from '../hooks/useBlogArticles';
import { RotateCcw as RotateCcwIcon } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export function Blog() {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [page, setPage] = useState(1);
  const perPage = 9;

  const isFiltered = search !== '' || selectedCategoryId !== 'all' || mediaFilter !== 'all';

  const { data, isLoading } = useBlogArticles({
    page: isFiltered ? page : 1,
    perPage,
    search: isFiltered ? search : undefined,
    categoryId: isFiltered ? selectedCategoryId : undefined,
    mediaFilter: isFiltered ? mediaFilter : undefined,
  });

  const articles = (data?.data || []) as any[];
  const total = data?.total || 0;
  const totalAll = data?.total_all || 0;
  const totalPages = data?.total_pages || 1;
  const categoryCounts = data?.category_counts || {};

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategoryId('all');
    setMediaFilter('all');
    setPage(1);
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setPage(1);
  };

  const highlightedArticle = articles?.[0];
  const featuredPosts = articles?.slice(1, 4) || [];

  return (
    <>
      <SEOHead title="Blog" description="Blog sur l'IA, Microsoft Learn, Power Platform, Cloud, DevOps et développement web." />
      <BlogLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4, md: 8 } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {!isFiltered && page === 1 ? (
              <>
                <Grid container spacing={4} sx={{ mb: 8, mt: 2, alignItems: 'stretch' }}>
                  <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
                    <HighlightedArticleCard article={highlightedArticle} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', pl: { md: 4 } }}>
                      <BlogCategoriesWidget 
                        selectedCategoryId={selectedCategoryId} 
                        onSelectCategory={handleCategorySelect}
                        categoryCounts={categoryCounts}
                        totalCount={totalAll}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <BlogSearchFilters 
                  search={search}
                  onSearchChange={setSearch}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={handleCategorySelect}
                  mediaFilter={mediaFilter}
                  onMediaFilterChange={setMediaFilter}
                  categoryCounts={categoryCounts}
                  totalCount={totalAll}
                  showCategoriesInline={false}
                />

                {featuredPosts.length > 0 && (
                  <Box sx={{ mb: 8 }}>
                    <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 4 }}>Sélection d'articles de spécialisation</Typography>
                    <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                      {featuredPosts.map((article) => (
                        <Grid size={{ xs: 12, md: 4 }} key={article.id} sx={{ display: 'flex' }}>
                          <Box sx={{ width: '100%' }}>
                            <RecentStoryCard article={article} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {articles.length > 4 && (
                  <Box sx={{ mb: 10 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Articles</Typography>
                    {articles.slice(4).map((article, index) => (
                      <ArticleListItem key={article.id} article={article} index={index} />
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ mt: 4 }}>
                <BlogSearchFilters 
                  search={search}
                  onSearchChange={setSearch}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={handleCategorySelect}
                  mediaFilter={mediaFilter}
                  onMediaFilterChange={setMediaFilter}
                  categoryCounts={categoryCounts}
                  totalCount={totalAll}
                  showCategoriesInline={true}
                />

                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedCategoryId === 'all' 
                      ? "Tous les contenus correspondants" 
                      : `Articles de la catégorie sélectionnée`}
                    <Typography component="span" variant="h5" sx={{ color: 'text.secondary', ml: 1, fontWeight: 500 }}>
                      ({total})
                    </Typography>
                  </Typography>

                  <Button 
                    startIcon={<RotateCcwIcon size={16} />}
                    onClick={handleResetFilters}
                    variant="text"
                    sx={{ color: '#1A1A1A', textTransform: 'none', fontWeight: 600 }}
                  >
                    Réinitialiser
                  </Button>
                </Box>

                {articles.length > 0 ? (
                  <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                      {articles.map((article) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id} sx={{ display: 'flex' }}>
                          <Box sx={{ width: '100%' }}>
                            <ArticleCard article={article} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <Pagination 
                          count={totalPages} 
                          page={page} 
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                          showFirstButton 
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 12, 
                    px: 3, 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    borderRadius: '16px',
                    bgcolor: 'background.paper',
                    mb: 10
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'text.secondary' }}>
                      <RotateCcwIcon size={48} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Aucun article trouvé
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      Aucun contenu ne correspond à vos filtres de recherche ou à la catégorie sélectionnée.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleResetFilters}
                      sx={{ 
                        borderRadius: '30px', 
                        px: 4, 
                        bgcolor: '#1A1A1A',
                        '&:hover': { bgcolor: '#333333' }
                      }}
                    >
                      Réinitialiser tous les filtres
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {!isFiltered && page === 1 && (
              <Box sx={{ mb: 8 }}>
                <BlogNewsletter />
              </Box>
            )}
          </>
        )}
      </Container>
    </BlogLayout>
    </>
  );
}
