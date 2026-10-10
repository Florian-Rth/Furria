import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/lib/public-news/schemas';

interface NewsPostHeadlineProps {
  post: NewsPost;
}

export const NewsPostHeadline: FC<NewsPostHeadlineProps> = ({ post }) => (
  <Typography variant="display" component="h1" sx={{ lineHeight: 0.96, hyphens: 'auto' }}>
    {post.title}
  </Typography>
);
