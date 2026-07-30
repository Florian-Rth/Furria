import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyInterestsLoadingLabel } from '@/features/membership/apply-content';

export const ApplyFormStatus: FC = () => (
  <Stack role="status" sx={{ gap: 1, maxWidth: '20rem' }}>
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
    >
      {applyInterestsLoadingLabel}
    </Typography>
    <LinearProgress />
  </Stack>
);
