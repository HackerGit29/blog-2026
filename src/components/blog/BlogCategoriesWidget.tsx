import React from 'react';
import { Box, Typography } from '@mui/material';
import { useBlogCategories } from '../../hooks/useBlogCategories';
import { motion } from 'motion/react';

interface BlogCategoriesWidgetProps {
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

export function BlogCategoriesWidget({ 
  selectedCategoryId = 'all', 
  onSelectCategory, 
  categoryCounts = {},
  totalCount = 0
}: BlogCategoriesWidgetProps) {
  const { data, isLoading } = useBlogCategories();
  const categories = data as any[];

  if (isLoading) return null;

  const handleCategoryClick = (id: string) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Catégories
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {/* "Tout" / All Category Chip */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'inline-block' }}
        >
          <Box 
            onClick={() => handleCategoryClick('all')}
            sx={{
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A',
              borderRadius: '32px', 
              pl: 2,
              pr: 0.75, 
              py: 0.75, 
              bgcolor: (theme) => selectedCategoryId === 'all' 
                ? (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A') 
                : 'background.paper',
              color: (theme) => selectedCategoryId === 'all' 
                ? (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') 
                : 'text.primary',
              cursor: 'pointer', 
              transition: 'all 0.2s', 
              '&:hover': { 
                bgcolor: (theme) => selectedCategoryId === 'all' 
                  ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#333333') 
                  : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') 
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
              Tout voir
            </Typography>
            <Box 
              sx={{
                bgcolor: (theme) => selectedCategoryId === 'all' 
                  ? (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') 
                  : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A'), 
                color: (theme) => selectedCategoryId === 'all' 
                  ? (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A') 
                  : (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF'), 
                borderRadius: '50%',
                minWidth: 24, 
                height: 24, 
                px: 0.5,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem', 
                fontWeight: 700
              }}
            >
              {totalCount}
            </Box>
          </Box>
        </motion.div>

        {/* Database Categories */}
        {categories?.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = categoryCounts[cat.id] !== undefined ? categoryCounts[cat.id] : 0;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-block' }}
            >
              <Box 
                onClick={() => handleCategoryClick(cat.id)}
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A',
                  borderRadius: '32px', 
                  pl: 2,
                  pr: 0.75, 
                  py: 0.75, 
                  bgcolor: (theme) => isSelected 
                    ? (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A') 
                    : 'background.paper',
                  color: (theme) => isSelected 
                    ? (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') 
                    : 'text.primary',
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  '&:hover': { 
                    bgcolor: (theme) => isSelected 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#333333') 
                      : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') 
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  {cat.name}
                </Typography>
                <Box 
                  sx={{
                    bgcolor: (theme) => isSelected 
                      ? (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') 
                      : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A'), 
                    color: (theme) => isSelected 
                      ? (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1A1A') 
                      : (theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF'), 
                    borderRadius: '50%',
                    minWidth: 24, 
                    height: 24, 
                    px: 0.5,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem', 
                    fontWeight: 700
                  }}
                >
                  {count}
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
