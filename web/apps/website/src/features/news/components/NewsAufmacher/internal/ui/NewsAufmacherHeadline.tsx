import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsAufmacherHeadlineProps {
  post: NewsPost;
}

export const NewsAufmacherHeadline: FC<NewsAufmacherHeadlineProps> = ({ post }) => (
  <Typography
    variant="h2"
    component="h2"
    data-kk-news-aufmacher-title
    sx={(theme) => ({
      fontSize: { xs: '1.75rem', md: '3rem' },
      lineHeight: 0.96,
      transition: theme.transitions.create(['color'], {
        duration: theme.transitions.duration.shortest,
      }),
    })}
  >
    {post.title}
  </Typography>
);
