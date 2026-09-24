import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import type { NewsPost } from '@/features/news/news-content';
import { heroCaptionNote } from '@/features/news/news-content';

interface NewsPostHeroProps {
  post: NewsPost;
}

export const NewsPostHero: FC<NewsPostHeroProps> = ({ post }) => (
  <Stack component="figure" data-kk-news-hero sx={{ m: 0, gap: 1 }}>
    <NewsMedia
      post={post}
      sx={{
        aspectRatio: kkTokens.aspectRatio.banner,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        typography: { xs: 'h1', md: 'display' },
      }}
    />
    {post.image !== null && (
      <Typography
        component="figcaption"
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        {heroCaptionNote}
      </Typography>
    )}
  </Stack>
);
