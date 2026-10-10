import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/lib/public-news/schemas';

interface NewsPostLeadProps {
  post: NewsPost;
}

export const NewsPostLead: FC<NewsPostLeadProps> = ({ post }) => (
  <Typography
    component="p"
    data-kk-news-lead
    sx={{
      typography: { xs: 'h3', md: 'h2' },
      lineHeight: 1.26,
      letterSpacing: '0.01em',
      color: 'text.secondary',
      textWrap: 'pretty',
    }}
  >
    {post.teaser}
  </Typography>
);
