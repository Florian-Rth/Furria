import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { CapacityBar } from '@/features/events/components/CapacityBar';
import { almostSoldOutTagLabel } from '@/features/events/next-event-content';
import {
  deriveCapacityBarColor,
  deriveSalesStatusLabel,
} from '@/features/events/sales-status-display';
import type { Event } from '@/lib/seed/events';

interface TicketPanelAvailabilityProps {
  event: Event;
  scarce: boolean;
}

export const TicketPanelAvailability: FC<TicketPanelAvailabilityProps> = ({ event, scarce }) => {
  const freeSeatsLabel = deriveSalesStatusLabel(event);

  const capacityBar =
    event.freeCount === null || event.capacity === null ? null : (
      <CapacityBar
        freeCount={event.freeCount}
        capacity={event.capacity}
        color={deriveCapacityBarColor(event.salesStatus)}
      />
    );

  const scarcityTag = scarce ? (
    <Chip size="small" color="warning" label={almostSoldOutTagLabel} />
  ) : null;

  return (
    <Stack sx={{ gap: 1, width: '100%' }}>
      {capacityBar}
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {freeSeatsLabel}
        </Typography>
        {scarcityTag}
      </Stack>
    </Stack>
  );
};
