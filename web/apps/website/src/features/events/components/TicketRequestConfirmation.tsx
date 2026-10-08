import { KkEyebrow, KkLead, KkSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { SubmittedTicketRequest } from '@/features/events/hooks/use-ticket-request-form';
import {
  ticketRequestThanksEyebrow,
  ticketRequestThanksTitle,
} from '@/features/events/ticket-request-content';
import { buildTicketRequestThanksText } from '@/features/events/ticket-request-display';
import type { Event } from '@/lib/public-events/schemas';
import { TicketRequestActions } from './TicketRequestActions';

interface TicketRequestConfirmationProps {
  event: Event;
  request: SubmittedTicketRequest;
}

export const TicketRequestConfirmation: FC<TicketRequestConfirmationProps> = ({
  event,
  request,
}) => {
  const thanksText = buildTicketRequestThanksText(event, request.ticketCount, request.email);

  return (
    <KkSection>
      <Stack sx={{ gap: 1 }}>
        <KkEyebrow>{ticketRequestThanksEyebrow}</KkEyebrow>
        <Typography variant="h1" component="h1" sx={{ textTransform: 'uppercase' }}>
          {ticketRequestThanksTitle}
        </Typography>
      </Stack>
      <KkLead>{thanksText}</KkLead>
      <TicketRequestActions event={event} />
    </KkSection>
  );
};
