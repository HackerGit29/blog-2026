import React from 'react';
import { Box, TextField, InputAdornment, Button, Typography, useTheme } from '@mui/material';
import { Search as SearchIcon, FileText as FileTextIcon, Play as PlayIcon } from 'lucide-react';
import { BlogCategoriesWidget } from './BlogCategoriesWidget';

interface BlogSearchFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  mediaFilter: 'all' | 'image' | 'video';
  onMediaFilterChange: (val: 'all' | 'image' | 'video') => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  showCategoriesInline?: boolean;
}

export function BlogSearchFilters({
  search,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  mediaFilter,
  onMediaFilterChange,
  categoryCounts,
  totalCount,
  showCategoriesInline = false
}: BlogSearchFiltersProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 6 }}>
      {/* Search Input and Media Toggles */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: '16px', 
        p: 3, 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.palette.mode === 'light' ? '0px 4px 20px rgba(0,0,0,0.02)' : 'none',
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Field */}
        <TextField
          placeholder="Rechercher un article, un tutoriel..."
          variant="outlined"
          fullWidth
          size="medium"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  <SearchIcon size={18} />
                </InputAdornment>
              ),
            }
          }}
          sx={{ 
            maxWidth: { md: 450 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              border: '1px solid #1A1A1A',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            }
          }}
        />

        {/* Media Format Filter Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'center', md: 'flex-end' } }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: 'text.secondary' }}>
            Format:
          </Typography>
          
          <Button 
            variant={mediaFilter === 'all' ? 'contained' : 'outlined'} 
            onClick={() => onMediaFilterChange('all')}
            size="small"
            sx={{ 
              borderRadius: '20px', 
              px: 3.5,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: mediaFilter === 'all' ? '#1A1A1A' : 'transparent',
              color: mediaFilter === 'all' ? '#FFFFFF' : '#1A1A1A',
              borderColor: '#1A1A1A',
              '&:hover': {
                bgcolor: mediaFilter === 'all' ? '#333333' : 'rgba(0,0,0,0.04)',
                borderColor: '#1A1A1A'
              }
            }}
          >
            Tout voir
          </Button>

          <Button 
            variant={mediaFilter === 'image' ? 'contained' : 'outlined'} 
            onClick={() => onMediaFilterChange('image')}
            size="small"
            startIcon={<FileTextIcon size={14} />}
            sx={{ 
              borderRadius: '20px', 
              px: 3.5,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: mediaFilter === 'image' ? '#1A1A1A' : 'transparent',
              color: mediaFilter === 'image' ? '#FFFFFF' : '#1A1A1A',
              borderColor: '#1A1A1A',
              '&:hover': {
                bgcolor: mediaFilter === 'image' ? '#333333' : 'rgba(0,0,0,0.04)',
                borderColor: '#1A1A1A'
              }
            }}
          >
            Articles
          </Button>

          <Button 
            variant={mediaFilter === 'video' ? 'contained' : 'outlined'} 
            onClick={() => onMediaFilterChange('video')}
            size="small"
            startIcon={<PlayIcon size={14} />}
            sx={{ 
              borderRadius: '20px', 
              px: 3.5,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: mediaFilter === 'video' ? '#1A1A1A' : 'transparent',
              color: mediaFilter === 'video' ? '#FFFFFF' : '#1A1A1A',
              borderColor: '#1A1A1A',
              '&:hover': {
                bgcolor: mediaFilter === 'video' ? '#333333' : 'rgba(0,0,0,0.04)',
                borderColor: '#1A1A1A'
              }
            }}
          >
            Vidéos
          </Button>
        </Box>
      </Box>

      {/* Optional Category Chips Rendered Inside Filters Area */}
      {showCategoriesInline && (
        <Box sx={{ mt: 3 }}>
          <BlogCategoriesWidget 
            selectedCategoryId={selectedCategoryId} 
            onSelectCategory={onCategoryChange}
            categoryCounts={categoryCounts}
            totalCount={totalCount}
          />
        </Box>
      )}
    </Box>
  );
}
