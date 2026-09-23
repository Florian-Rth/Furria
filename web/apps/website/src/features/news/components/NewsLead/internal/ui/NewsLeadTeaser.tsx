import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsLeadTeaserProps {
  post: NewsPost;
}

export const NewsLeadTeaser: FC<NewsLeadTeaserProps> = ({ post }) => (
  <Typography
    variant="body1"
    sx={{
      color: 'text.secondary',
      textWrap: 'pretty',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 3,
      overflow: 'hidden',
    }}
  >
    {post.teaser}
  </Typography>
);
