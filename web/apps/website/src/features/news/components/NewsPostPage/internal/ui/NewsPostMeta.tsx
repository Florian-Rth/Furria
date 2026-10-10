import { KkNewsCategoryChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { buildPostByline, categoryToneOf } from '@/features/news/news-content';

interface NewsPostMetaProps {
  post: NewsPost;
}

export const NewsPostMeta: FC<NewsPostMetaProps> = ({ post }) => {
  const tone = categoryToneOf(post.category);
  const byline = buildPostByline(post);

  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <KkNewsCategoryChip tone={tone} label={post.category} />
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {byline}
      </Typography>
    </Stack>
  );
};
