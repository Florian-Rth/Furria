import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsPostHeadlineProps {
  post: NewsPost;
}

export const NewsPostHeadline: FC<NewsPostHeadlineProps> = ({ post }) => (
  <Typography variant="display" component="h1" sx={{ lineHeight: 0.96 }}>
    {post.title}
  </Typography>
);
