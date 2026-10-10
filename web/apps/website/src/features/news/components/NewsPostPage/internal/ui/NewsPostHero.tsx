import { KkNewsMedia, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsPhotoOf } from '@/features/news/components/news-photo';
import type { NewsPost } from '@/features/news/news-content';
import { categoryToneOf, heroCaptionNote } from '@/features/news/news-content';

interface NewsPostHeroProps {
  post: NewsPost;
}

export const NewsPostHero: FC<NewsPostHeroProps> = ({ post }) => {
  const photo = newsPhotoOf(post);
  const tone = categoryToneOf(post.category);

  return (
    <Stack component="figure" data-kk-news-hero sx={{ m: 0, gap: 1 }}>
      <KkNewsMedia
        photo={photo}
        tone={tone}
        posterWord={post.category}
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
};
