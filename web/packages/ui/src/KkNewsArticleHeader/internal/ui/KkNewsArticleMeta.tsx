import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsCategory } from '../../../internal/news-surface/news-category';
import { KkNewsCategoryChip } from '../../../KkNewsCategoryChip';

interface KkNewsArticleMetaProps {
  category: KkNewsCategory;
  byline: string;
}

export const KkNewsArticleMeta: FC<KkNewsArticleMetaProps> = ({ category, byline }) => (
  <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
    <KkNewsCategoryChip tone={category.tone} label={category.label} />
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
      {byline}
    </Typography>
  </Stack>
);
