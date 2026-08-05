import { KkEyebrow } from '@furria/ui';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { applyInterestsLoadingLabel } from '@/features/membership/apply-content';

export const ApplyFormStatus: FC = () => (
  <Stack role="status" sx={{ gap: 1, maxWidth: '20rem' }}>
    <KkEyebrow tone="muted">{applyInterestsLoadingLabel}</KkEyebrow>
    <LinearProgress />
  </Stack>
);
