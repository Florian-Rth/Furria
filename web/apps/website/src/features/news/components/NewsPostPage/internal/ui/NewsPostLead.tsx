import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news/news-content';

interface NewsPostLeadProps {
  post: NewsPost;
}

export const NewsPostLead: FC<NewsPostLeadProps> = ({ post }) => (
  <Typography
    component="p"
    data-kk-news-lead
    sx={{
      fontFamily: kkTokens.font.display,
      fontSize: { xs: '1.125rem', md: '1.5625rem' },
      lineHeight: 1.26,
      letterSpacing: '0.01em',
      color: 'text.secondary',
      textWrap: 'pretty',
    }}
  >
    {post.teaser}
  </Typography>
);
