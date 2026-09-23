import { KkEyebrow } from '@furria/ui';
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
    <KkEyebrow tone="onAccent">{recruitBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ typography: { xs: 'h2', md: 'h1' } }}>
      {recruitBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92 }}>
      {recruitBandContent.intro}
    </Typography>
  </Stack>
);
