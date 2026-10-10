import { KkNewsCategoryChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildPostByline, categoryLabelOf, categoryToneOf } from '@/features/news/news-content';
import type { NewsArticle } from '@/lib/public-news/schemas';

interface NewsPostMetaProps {
  article: NewsArticle;
}

export const NewsPostMeta: FC<NewsPostMetaProps> = ({ article }) => {
  const tone = categoryToneOf(article.category);
  const label = categoryLabelOf(article.category);
  const byline = buildPostByline(article);

  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <KkNewsCategoryChip tone={tone} label={label} />
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {byline}
      </Typography>
    </Stack>
  );
};
