import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  ticketRequestConsentLead,
  ticketRequestConsentTail,
  ticketRequestPrivacyHref,
  ticketRequestPrivacyLabel,
} from '@/features/events/ticket-request-content';

export const TicketRequestConsentLabel: FC = () => (
  <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
    {`${ticketRequestConsentLead} `}
    <Link href={ticketRequestPrivacyHref} color="primary">
      {ticketRequestPrivacyLabel}
    </Link>
    {` ${ticketRequestConsentTail}`}
  </Typography>
);
