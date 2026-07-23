import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { narrenrufBandContent } from '@/features/club/narrenruf-content';

export const NarrenrufCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 2, maxWidth: { md: 460 } }}>
    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.16em', opacity: 0.85 }}>
      {narrenrufBandContent.kicker}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem', opacity: 0.95 }}>
      {narrenrufBandContent.sentence}
    </Typography>
  </Stack>
);
