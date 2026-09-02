import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { TicketCtaButton } from '@/features/events/components/TicketCtaButton';
import type { OrderFlowNotice } from '@/features/events/order-flow-display';

interface OrderFlowStateNoticeProps {
  notice: OrderFlowNotice;
}

export const OrderFlowStateNotice: FC<OrderFlowStateNoticeProps> = ({ notice }) => (
  <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
    <KkNote>{notice.body}</KkNote>
    <TicketCtaButton cta={notice.cta} />
  </Stack>
);
