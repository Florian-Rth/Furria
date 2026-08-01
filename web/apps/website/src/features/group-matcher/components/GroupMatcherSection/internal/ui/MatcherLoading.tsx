import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherLabels } from '@/features/group-matcher/matcher-content';

export const MatcherLoading: FC = () => (
  <Stack role="status" sx={{ gap: { xs: 3, md: 4 } }}>
    <Stack sx={{ gap: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {matcherLabels.loading}
      </Typography>
      <LinearProgress />
    </Stack>
    <Stack sx={{ gap: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} />
      <Skeleton variant="text" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, width: '70%' }} />
    </Stack>
    <Skeleton variant="rounded" sx={{ height: '2.75rem', width: '60%' }} />
  </Stack>
);
