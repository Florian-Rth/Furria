import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { joinInBandContent } from '@/features/landing/join-in-content';

export const JoinInCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 1.5, maxWidth: { md: 640 } }}>
    <KkEyebrow tone="onAccent">{joinInBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ typography: { xs: 'h2', md: 'h1' } }}>
      {joinInBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92, maxWidth: 520 }}>
      {joinInBandContent.body}
    </Typography>
  </Stack>
);
