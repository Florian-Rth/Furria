import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsProgramBandContent } from '@/features/news/news-content';

export const NewsProgramCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '34rem' } }}>
    <KkEyebrow tone="onAccent">{newsProgramBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
      {newsProgramBandContent.headline}
    </Typography>
  </Stack>
);
