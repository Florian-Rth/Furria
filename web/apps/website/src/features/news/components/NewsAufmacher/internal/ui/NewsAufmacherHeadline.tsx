import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsAufmacherHeadlineProps {
  post: NewsPost;
}

export const NewsAufmacherHeadline: FC<NewsAufmacherHeadlineProps> = ({ post }) => (
  <Typography
    variant="h1"
    component="h2"
    data-kk-news-aufmacher-title
    sx={(theme) => ({
      typography: { xs: 'h1', md: 'display' },
      lineHeight: 0.96,
      transition: theme.transitions.create(['color'], {
        duration: theme.transitions.duration.shortest,
      }),
    })}
  >
    {post.title}
  </Typography>
);
