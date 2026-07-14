import React, { useState, useMemo } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Button } from '@mui/material';
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

export function Blog() {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');

  // Fetch all articles to compute categories' article counts and totals
  const { data: allArticlesData, isLoading: isLoadingAll } = useBlogArticles();
  const allArticles = (allArticlesData || []) as any[];

  // Fetch filtered articles
  const { data: articlesData, isLoading: isLoadingFiltered } = useBlogArticles({
    search,
    categoryId: selectedCategoryId,
    mediaFilter,
  });
  const articles = (articlesData || []) as any[];

  const isLoading = isLoadingAll || isLoadingFiltered;

  // Compute category counts dynamically based on all published articles
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (allArticles) {
      allArticles.forEach((art: any) => {
        if (art.category_id) {
          counts[art.category_id] = (counts[art.category_id] || 0) + 1;
        }
      });
    }
    return counts;
  }, [allArticles]);

  const totalCount = allArticles.length;

  // Layout slices for unfiltered view
  const highlightedArticle = allArticles?.[0];
  const featuredPosts = allArticles?.slice(1, 4) || [];
  const listPosts = allArticles?.slice(4, 7) || []; // Affiche uniquement les 3 articles suivants sous forme de liste

  const isFiltered = search !== '' || selectedCategoryId !== 'all' || mediaFilter !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategoryId('all');
    setMediaFilter('all');
  };

  return (
    <BlogLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4, md: 8 } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* NO FILTER ACTIVE: Show Hero, Interactive Widget, Search, and Structured sections */}
            {!isFiltered ? (
              <>
                {/* Section 1: Highlighted Post & Categories Widget */}
                <Grid container spacing={4} sx={{ mb: 8, mt: 2, alignItems: 'stretch' }}>
                  <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
                    <HighlightedArticleCard article={highlightedArticle} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', pl: { md: 4 } }}>
                      <BlogCategoriesWidget 
                        selectedCategoryId={selectedCategoryId} 
                        onSelectCategory={setSelectedCategoryId}
                        categoryCounts={categoryCounts}
                        totalCount={totalCount}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Filter and Search Bar */}
                <BlogSearchFilters 
                  search={search}
                  onSearchChange={setSearch}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={setSelectedCategoryId}
                  mediaFilter={mediaFilter}
                  onMediaFilterChange={setMediaFilter}
                  categoryCounts={categoryCounts}
                  totalCount={totalCount}
                  showCategoriesInline={false}
                />

                {/* Section 3: Featured Blog Posts */}
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

                {/* Section 4: All Remaining List Posts (Extended layout to see everything!) */}
                {listPosts.length > 0 && (
                  <Box sx={{ mb: 10 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Tous nos articles techniques et ressources</Typography>
                    {listPosts.map((article, index) => (
                      <ArticleListItem key={article.id} article={article} index={index} />
                    ))}
                  </Box>
                )}
              </>
            ) : (
              /* FILTER ACTIVE: Show inline categories, filters, and dynamic unified grid of all matches */
              <Box sx={{ mt: 4 }}>
                <BlogSearchFilters 
                  search={search}
                  onSearchChange={setSearch}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={setSelectedCategoryId}
                  mediaFilter={mediaFilter}
                  onMediaFilterChange={setMediaFilter}
                  categoryCounts={categoryCounts}
                  totalCount={totalCount}
                  showCategoriesInline={true}
                />

                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedCategoryId === 'all' 
                      ? "Tous les contenus correspondants" 
                      : `Articles de la catégorie sélectionnée`}
                    <Typography component="span" variant="h5" sx={{ color: 'text.secondary', ml: 1, fontWeight: 500 }}>
                      ({articles?.length || 0})
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

                {articles && articles.length > 0 ? (
                  <Grid container spacing={3} sx={{ mb: 10 }}>
                    {articles.map((article) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id} sx={{ display: 'flex' }}>
                        <Box sx={{ width: '100%' }}>
                          <ArticleCard article={article} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
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

            {/* Section 5: Newsletter Subscriber Banner */}
            <Box sx={{ mb: 8 }}>
              <BlogNewsletter />
            </Box>
          </>
        )}
      </Container>
    </BlogLayout>
  );
}
