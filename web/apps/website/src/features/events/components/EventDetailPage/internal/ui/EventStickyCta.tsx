import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { StickyActionBar } from '@/features/events/components/StickyActionBar';
import { TicketRequestCta } from '@/features/events/components/TicketRequestCta';
import { ticketPanelPriceLabel } from '@/features/events/event-detail-content';
import { useTicketRequestWindow } from '@/features/events/hooks/use-ticket-request-window';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/public-events/schemas';

interface EventStickyCtaProps {
  event: Event;
}

export const EventStickyCta: FC<EventStickyCtaProps> = ({ event }) => {
  const isWindowOpen = useTicketRequestWindow(event);
  if (!isWindowOpen) {
    return null;
  }

  const priceLine =
    event.priceCents === null ? null : (
      <Typography variant="subtitle1" component="p" sx={{ fontWeight: 800 }}>
        {formatEuros(event.priceCents)}{' '}
        <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
          {ticketPanelPriceLabel}
        </Typography>
      </Typography>
    );

  return (
    <StickyActionBar sx={{ display: { desktop: 'none' }, justifyContent: 'space-between' }}>
      {priceLine}
      <TicketRequestCta event={event} sx={{ flexGrow: 1, maxWidth: '14rem' }} />
    </StickyActionBar>
  );
};
