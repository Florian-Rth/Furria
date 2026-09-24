import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { orderLoadingLabel } from '@/features/events/order-confirmation-content';

export const OrderConfirmationLoading: FC = () => (
  <Stack role="status" sx={{ gap: { xs: 3, md: 4 } }}>
    <Stack sx={{ gap: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {orderLoadingLabel}
      </Typography>
      <LinearProgress />
    </Stack>
    <Stack sx={{ gap: 1 }}>
      <Skeleton variant="text" sx={{ typography: 'display' }} />
      <Skeleton variant="text" sx={{ typography: 'display', width: '60%' }} />
    </Stack>
    <Skeleton variant="rounded" sx={{ height: '14rem', maxWidth: '48rem' }} />
  </Stack>
);
