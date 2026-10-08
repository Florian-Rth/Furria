import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Event } from '@/lib/public-events/schemas';
import { buildTicketRequestHref } from '../event-display';
import { useTicketRequestWindow } from '../hooks/use-ticket-request-window';
import { ticketRequestCtaLabel } from '../ticket-request-content';

interface TicketRequestCtaProps {
  event: Event;
  sx?: SxProps<Theme>;
}

export const TicketRequestCta: FC<TicketRequestCtaProps> = ({ event, sx }) => {
  const isWindowOpen = useTicketRequestWindow(event);
  const requestHref = buildTicketRequestHref(event);

  if (!isWindowOpen) {
    return null;
  }

  return (
    <Button
      component={RouterLink}
      to={requestHref}
      variant="contained"
      color="primary"
      size="large"
      data-kk-ticket-cta
      sx={sx}
    >
      {ticketRequestCtaLabel}
    </Button>
  );
};
