import { KkEyebrow, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { narrenrufBandContent } from '@/features/club/narrenruf-content';

export const NarrenrufCopy: FC = () => (
  <Stack sx={{ position: 'relative', zIndex: 1, gap: 2, maxWidth: { md: 460 } }}>
    <KkEyebrow tone="onAccent">{narrenrufBandContent.kicker}</KkEyebrow>
    <Typography
      variant="h3"
      component="p"
      sx={{
        fontFamily: kkTokens.font.body,
        fontWeight: 600,
        letterSpacing: 'normal',
        lineHeight: 1.45,
        opacity: 0.95,
      }}
    >
      {narrenrufBandContent.sentence}
    </Typography>
  </Stack>
);
