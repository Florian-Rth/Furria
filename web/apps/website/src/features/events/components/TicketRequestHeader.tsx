import { KkEyebrow, KkLead } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import { buildEventHref } from '@/features/events/event-display';
import {
  buildTicketRequestBackLabel,
  ticketRequestLead,
} from '@/features/events/ticket-request-content';
import { buildTicketRequestEyebrow } from '@/features/events/ticket-request-display';
import type { Event } from '@/lib/public-events/schemas';

interface TicketRequestHeaderProps {
  event: Event;
}

export const TicketRequestHeader: FC<TicketRequestHeaderProps> = ({ event }) => {
  const eventHref = buildEventHref(event);
  const backLabel = buildTicketRequestBackLabel(event.title);
  const eyebrow = buildTicketRequestEyebrow(event);

  return (
    <Stack sx={{ gap: { xs: 2, md: 3 } }}>
      <BackLink to={eventHref} sx={{ alignSelf: 'flex-start' }}>
        {backLabel}
      </BackLink>
      <Stack sx={{ gap: 1 }}>
        <KkEyebrow>{eyebrow}</KkEyebrow>
        <Typography variant="h1" component="h1" sx={{ textTransform: 'uppercase' }}>
          {event.title}
        </Typography>
      </Stack>
      <KkLead>{ticketRequestLead}</KkLead>
    </Stack>
  );
};
