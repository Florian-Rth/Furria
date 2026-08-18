import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { CapacityBar } from '@/features/events/components/CapacityBar';
import {
  deriveOrderFlowAvailabilityLabel,
  deriveOrderFlowCapacity,
} from '@/features/events/order-flow-display';
import { deriveCapacityBarColor } from '@/features/events/sales-status-display';
import type { Event } from '@/lib/seed/events';

interface OrderFlowAvailabilityProps {
  event: Event;
}

export const OrderFlowAvailability: FC<OrderFlowAvailabilityProps> = ({ event }) => {
  const label = deriveOrderFlowAvailabilityLabel(event);
  const capacity = deriveOrderFlowCapacity(event);
  const capacityBarColor = deriveCapacityBarColor(event.salesStatus);

  const capacityBar =
    capacity === null ? null : (
      <CapacityBar
        freeCount={capacity.freeCount}
        capacity={capacity.capacity}
        color={capacityBarColor}
      />
    );

  return (
    <Stack sx={{ gap: 1, width: '100%' }}>
      <Typography variant="subtitle1" component="p" sx={{ fontWeight: 800 }}>
        {label}
      </Typography>
      {capacityBar}
    </Stack>
  );
};
