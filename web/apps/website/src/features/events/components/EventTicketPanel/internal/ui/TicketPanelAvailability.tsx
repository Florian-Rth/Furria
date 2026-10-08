import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { fewLeftTagLabel } from '@/features/events/next-event-content';
import { deriveSalesStatusLabel } from '@/features/events/sales-status-display';
import type { Event } from '@/lib/public-events/schemas';

interface TicketPanelAvailabilityProps {
  event: Event;
  scarce: boolean;
}

export const TicketPanelAvailability: FC<TicketPanelAvailabilityProps> = ({ event, scarce }) => {
  const availabilityLabel = deriveSalesStatusLabel(event);

  const scarcityTag = scarce ? <Chip size="small" color="warning" label={fewLeftTagLabel} /> : null;

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {availabilityLabel}
      </Typography>
      {scarcityTag}
    </Stack>
  );
};
