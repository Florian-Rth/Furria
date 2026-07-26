import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsPostHeadlineProps {
  post: NewsPost;
}

export const NewsPostHeadline: FC<NewsPostHeadlineProps> = ({ post }) => (
  <Typography
    variant="h1"
    component="h1"
    sx={{ fontSize: { xs: '2.125rem', md: '3.875rem' }, lineHeight: 0.96 }}
  >
    {post.title}
  </Typography>
);
