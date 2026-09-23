import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsEventsBandContent } from '@/features/news/news-content';

export const NewsEventsCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '34rem' } }}>
    <KkEyebrow tone="onAccent">{newsEventsBandContent.kicker}</KkEyebrow>
    <Typography
      variant="h2"
      component="h2"
      sx={{ typography: { xs: 'h2', md: 'h1' }, textWrap: 'balance' }}
    >
      {newsEventsBandContent.headline}
    </Typography>
  </Stack>
);
