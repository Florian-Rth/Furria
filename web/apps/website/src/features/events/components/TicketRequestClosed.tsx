import { KkEyebrow, KkLead, KkSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { EventTicketPanel } from '@/features/events/components/EventTicketPanel/EventTicketPanel';
import {
  ticketRequestClosedEyebrow,
  ticketRequestClosedLead,
  ticketRequestClosedTitle,
} from '@/features/events/ticket-request-content';
import type { Event } from '@/lib/public-events/schemas';
import { TicketRequestActions } from './TicketRequestActions';

interface TicketRequestClosedProps {
  event: Event;
}

export const TicketRequestClosed: FC<TicketRequestClosedProps> = ({ event }) => (
  <KkSection>
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow>{ticketRequestClosedEyebrow}</KkEyebrow>
      <Typography variant="h1" component="h1" sx={{ textTransform: 'uppercase' }}>
        {ticketRequestClosedTitle}
      </Typography>
    </Stack>
    <KkLead>{ticketRequestClosedLead}</KkLead>
    <Stack sx={{ maxWidth: '28rem' }}>
      <EventTicketPanel event={event} />
    </Stack>
    <TicketRequestActions event={event} />
  </KkSection>
);
