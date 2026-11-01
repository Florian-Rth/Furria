import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkNewsFit } from './internal/news-surface/news-fit';
import { fitted } from './internal/news-surface/news-fit';
import { KkNewsMedia } from './KkNewsMedia';
import { kkTokens } from './tokens';

interface KkNewsHeroProps {
  photo: ReactNode;
  caption: string | null;
  fit?: KkNewsFit;
}

export const KkNewsHero: FC<KkNewsHeroProps> = ({ photo, caption, fit = 'page' }) => {
  const captionLine =
    caption === null ? null : (
      <Typography
        component="figcaption"
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        {caption}
      </Typography>
    );

  return (
    <Stack component="figure" data-kk-news-hero sx={{ m: 0, gap: 1 }}>
      <KkNewsMedia
        photo={photo}
        sx={{
          aspectRatio: kkTokens.aspectRatio.banner,
          border: 1,
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
          typography: fitted(fit, { xs: 'h1', md: 'display' }),
        }}
      />
      {captionLine}
    </Stack>
  );
};
