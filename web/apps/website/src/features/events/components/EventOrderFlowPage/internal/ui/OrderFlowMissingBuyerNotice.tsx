import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderFlowMissingBuyerNotice } from '@/features/events/order-flow-content';

export const OrderFlowMissingBuyerNotice: FC = () => (
  <OrderPanel tone="content" sx={{ gap: 3 }}>
    <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
      <Typography variant="h2" component="h2">
        {orderFlowMissingBuyerNotice.headline}
      </Typography>
      <KkNote>{orderFlowMissingBuyerNotice.body}</KkNote>
    </Stack>
  </OrderPanel>
);
