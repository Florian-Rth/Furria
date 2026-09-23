import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsLeadHeadlineProps {
  post: NewsPost;
}

export const NewsLeadHeadline: FC<NewsLeadHeadlineProps> = ({ post }) => (
  <Typography
    variant="h1"
    component="h2"
    data-kk-news-lead-title
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
