import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { StickyActionBar } from '@/features/events/components/StickyActionBar';
import { TicketCtaButton } from '@/features/events/components/TicketCtaButton';
import { ticketPanelPriceLabel } from '@/features/events/event-detail-content';
import { deriveTicketPanelCta } from '@/features/events/ticket-panel-display';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';

interface EventStickyCtaProps {
  event: Event;
}

export const EventStickyCta: FC<EventStickyCtaProps> = ({ event }) => {
  const cta = deriveTicketPanelCta(event);
  if (cta === null) {
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
      <TicketCtaButton cta={cta} sx={{ flexGrow: 1, maxWidth: '14rem' }} />
    </StickyActionBar>
  );
};
