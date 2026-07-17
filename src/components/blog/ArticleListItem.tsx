import { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { DISPLAY_DATE, getAuthor } from './ArticleCard';

export interface ArticleListItemProps {
  article: any;
  index?: number;
}

export function ArticleListItem({ article, index = 0 }: ArticleListItemProps) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: false });
  const author = getAuthor(article);

  if (!article) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      style={{ width: '100%' }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          py: 3, 
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 }
        }}
      >
        <Box sx={{ 
          bgcolor: 'secondary.main', 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: '16px', 
          px: 3, 
          py: 1, 
          minWidth: 220,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {author.name} | {DISPLAY_DATE} | {article.reading_time || 5} min
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, lineHeight: 1.3 }}>
          {article.title}
        </Typography>
        <Typography 
          onClick={() => navigate(`${base}/blog/${article.slug}`)}
          variant="button" 
          sx={{ 
            fontWeight: 800, 
            cursor: 'pointer', 
            whiteSpace: 'nowrap',
            borderBottom: '2px solid',
            borderBottomColor: 'text.primary',
            lineHeight: 1,
            pb: 0.5,
            textTransform: 'none',
            '&:hover': { color: 'primary.main', borderBottomColor: 'primary.main' }
          }}
        >
          Lire la suite
        </Typography>
      </Box>
    </motion.div>
  );
}

