import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsProgramBandContent } from '@/features/news/news-content';

export const NewsProgramCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '34rem' } }}>
    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.16em', opacity: 0.85 }}>
      {newsProgramBandContent.kicker}
    </Typography>
    <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
      {newsProgramBandContent.headline}
    </Typography>
  </Stack>
);
