import Chip from '@mui/material/Chip';
import type { FC } from 'react';
import { newsPaintOf } from './KkNewsProof/internal/logic/news-paint';
import type { KkNewsTone } from './KkNewsProof/news-proof-types';

interface KkNewsCategoryChipProps {
  tone: KkNewsTone;
  label: string;
}

export const KkNewsCategoryChip: FC<KkNewsCategoryChipProps> = ({ tone, label }) => (
  <Chip
    data-kk-news-category
    size="small"
    label={label}
    sx={(theme) => {
      const paint = newsPaintOf(theme, tone);
      return {
        bgcolor: paint.fill,
        color: paint.ink,
        typography: 'caption',
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      };
    }}
  />
);
