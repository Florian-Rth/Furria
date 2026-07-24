import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { recruitBandContent } from '@/features/club/recruit-content';

export const RecruitCopy: FC = () => (
  <Stack
    sx={{
      position: 'relative',
      zIndex: 1,
      alignItems: 'center',
      textAlign: 'center',
      gap: 2,
      maxWidth: 640,
    }}
  >
    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.16em', opacity: 0.85 }}>
      {recruitBandContent.kicker}
    </Typography>
    <Typography variant="h2" component="h2">
      {recruitBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92 }}>
      {recruitBandContent.intro}
    </Typography>
  </Stack>
);
