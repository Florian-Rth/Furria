import { KkEyebrow, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { OrderFlowPlaceholder } from '@/features/events/order-flow-content';
import { orderFlowPlaceholderKicker } from '@/features/events/order-flow-content';

interface OrderFlowPlaceholderPanelProps {
  placeholder: OrderFlowPlaceholder;
}

export const OrderFlowPlaceholderPanel: FC<OrderFlowPlaceholderPanelProps> = ({ placeholder }) => (
  <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
    <KkEyebrow tone="muted">{orderFlowPlaceholderKicker}</KkEyebrow>
    <Typography variant="h2" component="h2">
      {placeholder.headline}
    </Typography>
    <KkNote>{placeholder.body}</KkNote>
  </Stack>
);
