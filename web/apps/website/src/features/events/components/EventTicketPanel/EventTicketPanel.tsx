import type { FC } from 'react';
import { TicketCtaButton } from '@/features/events/components/TicketCtaButton';
import {
  deriveTicketPanelCta,
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from '@/features/events/ticket-panel-display';
import type { Event } from '@/lib/seed/events';
import { TicketPanelShell } from './internal/layout/TicketPanelShell';
import { TicketPanelAvailability } from './internal/ui/TicketPanelAvailability';
import { TicketPanelCountdown } from './internal/ui/TicketPanelCountdown';
import { TicketPanelNote } from './internal/ui/TicketPanelNote';
import { TicketPanelPrice } from './internal/ui/TicketPanelPrice';

interface EventTicketPanelProps {
  event: Event;
}

export const EventTicketPanel: FC<EventTicketPanelProps> = ({ event }) => {
  const face = deriveTicketPanelFace(event);
  const cta = deriveTicketPanelCta(event);
  const note = deriveTicketPanelNote(face);
  const priceCents = face.kind === 'cancelled' ? null : event.priceCents;

  const countdown =
    face.kind === 'presale' ? <TicketPanelCountdown targetIso={face.presaleStartsAt} /> : null;

  const availability =
    face.kind === 'onSale' ? <TicketPanelAvailability event={event} scarce={face.scarce} /> : null;

  const noteLine = note === null ? null : <TicketPanelNote>{note}</TicketPanelNote>;

  const ctaButton = cta === null ? null : <TicketCtaButton cta={cta} />;

  return (
    <TicketPanelShell>
      <TicketPanelPrice priceCents={priceCents} />
      {countdown}
      {availability}
      {noteLine}
      {ctaButton}
    </TicketPanelShell>
  );
};
