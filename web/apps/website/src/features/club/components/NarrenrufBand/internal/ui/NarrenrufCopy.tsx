import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { narrenrufBandContent } from '@/features/club/narrenruf-content';

export const NarrenrufCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 2, maxWidth: { md: 460 } }}>
    <KkEyebrow tone="onAccent">{narrenrufBandContent.kicker}</KkEyebrow>
    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem', opacity: 0.95 }}>
      {narrenrufBandContent.sentence}
    </Typography>
  </Stack>
);
