import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  deriveOrderFlowPriceLine,
  deriveOrderFlowStepSummary,
} from '@/features/events/order-flow-display';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';
import type { Event } from '@/lib/seed/events';

interface OrderFlowStepSummaryProps {
  event: Event;
  step: OrderFlowStep;
}

export const OrderFlowStepSummary: FC<OrderFlowStepSummaryProps> = ({ event, step }) => {
  const summary = deriveOrderFlowStepSummary(step);
  const priceLine = deriveOrderFlowPriceLine(event);
  const price =
    priceLine === null ? null : (
      <Typography variant="caption" component="p" sx={{ color: 'text.secondary' }}>
        {priceLine}
      </Typography>
    );

  return (
    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
      <Typography variant="subtitle2" component="p" sx={{ fontWeight: 800 }}>
        {summary}
      </Typography>
      {price}
    </Stack>
  );
};
