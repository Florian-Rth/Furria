import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { NewsCategoryChip } from '@/features/news/components/NewsCategoryChip';
import type { NewsPost } from '@/features/news/news-content';
import { buildPostByline } from '@/features/news/news-content';

interface NewsPostMetaProps {
  post: NewsPost;
}

export const NewsPostMeta: FC<NewsPostMetaProps> = ({ post }) => (
  <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
    <NewsCategoryChip category={post.category} />
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
      {buildPostByline(post)}
    </Typography>
  </Stack>
);
