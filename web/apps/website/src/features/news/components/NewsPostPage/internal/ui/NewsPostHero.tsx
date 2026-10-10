import { KkNewsMedia, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsPhotoOf } from '@/features/news/components/news-photo';
import { categoryLabelOf, categoryToneOf } from '@/features/news/news-content';
import type { NewsArticle } from '@/lib/public-news/schemas';

const HERO_PHOTO_SIZES = '(min-width: 900px) 45rem, 100vw';

interface NewsPostHeroProps {
  article: NewsArticle;
}

export const NewsPostHero: FC<NewsPostHeroProps> = ({ article }) => {
  const photo = newsPhotoOf(article.picture, HERO_PHOTO_SIZES);
  const tone = categoryToneOf(article.category);
  const posterWord = categoryLabelOf(article.category);
  const caption =
    article.picture === null || article.pictureCaption === null ? null : (
      <Typography
        component="figcaption"
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        {article.pictureCaption}
      </Typography>
    );

  return (
    <Stack component="figure" data-kk-news-hero sx={{ m: 0, gap: 1 }}>
      <KkNewsMedia
        photo={photo}
        tone={tone}
        posterWord={posterWord}
        sx={{
          aspectRatio: kkTokens.aspectRatio.banner,
          border: 1,
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
          typography: { xs: 'h1', md: 'display' },
        }}
      />
      {caption}
    </Stack>
  );
};
