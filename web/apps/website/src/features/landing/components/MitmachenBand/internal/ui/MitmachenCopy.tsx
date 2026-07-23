import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { mitmachenBandContent } from '@/features/landing/mitmachen-content';

export const MitmachenCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 1.5, maxWidth: { md: 640 } }}>
    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.16em', opacity: 0.85 }}>
      {mitmachenBandContent.kicker}
    </Typography>
    <Typography variant="h2" component="h2">
      {mitmachenBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92, maxWidth: 520 }}>
      {mitmachenBandContent.body}
    </Typography>
  </Stack>
);
