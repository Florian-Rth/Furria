import Chip from '@mui/material/Chip';
import type { FC } from 'react';
import type { NewsCategory } from '@/features/news/news-content';
import { resolveCategoryContrastText, resolveCategoryTint } from '@/features/news/news-content';

interface NewsCategoryChipProps {
  category: NewsCategory;
}

export const NewsCategoryChip: FC<NewsCategoryChipProps> = ({ category }) => (
  <Chip
    data-kk-news-category
    size="small"
    label={category}
    sx={(theme) => ({
      bgcolor: resolveCategoryTint(theme, category),
      color: resolveCategoryContrastText(theme, category),
      fontWeight: 900,
      fontSize: '0.6875rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    })}
  />
);
