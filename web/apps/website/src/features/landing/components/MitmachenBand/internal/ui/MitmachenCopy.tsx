import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { mitmachenBandContent } from '@/features/landing/mitmachen-content';

export const MitmachenCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 1.5, maxWidth: { md: 640 } }}>
    <KkEyebrow tone="onAccent">{mitmachenBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2">
      {mitmachenBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92, maxWidth: 520 }}>
      {mitmachenBandContent.body}
    </Typography>
  </Stack>
);
