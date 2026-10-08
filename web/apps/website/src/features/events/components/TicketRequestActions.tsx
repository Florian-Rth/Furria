import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventHref } from '@/features/events/event-display';
import {
  ticketRequestAllEventsHref,
  ticketRequestAllEventsLabel,
  ticketRequestEventLabel,
} from '@/features/events/ticket-request-content';
import type { Event } from '@/lib/public-events/schemas';

interface TicketRequestActionsProps {
  event: Event;
}

export const TicketRequestActions: FC<TicketRequestActionsProps> = ({ event }) => {
  const eventHref = buildEventHref(event);

  return (
    <Stack direction="row" sx={{ gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
      <Button
        component={RouterLink}
        to={eventHref}
        variant="contained"
        color="primary"
        size="large"
      >
        {ticketRequestEventLabel}
      </Button>
      <Button
        component={RouterLink}
        to={ticketRequestAllEventsHref}
        variant="outlined"
        size="large"
      >
        {ticketRequestAllEventsLabel}
      </Button>
    </Stack>
  );
};
