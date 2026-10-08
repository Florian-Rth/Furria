import type { FC, ReactNode } from 'react';
import {
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from '@/features/events/ticket-panel-display';
import type { Event } from '@/lib/public-events/schemas';
import { TicketPanelShell } from './internal/layout/TicketPanelShell';
import { TicketPanelAvailability } from './internal/ui/TicketPanelAvailability';
import { TicketPanelCountdown } from './internal/ui/TicketPanelCountdown';
import { TicketPanelNote } from './internal/ui/TicketPanelNote';
import { TicketPanelPrice } from './internal/ui/TicketPanelPrice';

interface EventTicketPanelProps {
  event: Event;
  action?: ReactNode;
}

export const EventTicketPanel: FC<EventTicketPanelProps> = ({ event, action }) => {
  const face = deriveTicketPanelFace(event);
  const note = deriveTicketPanelNote(face);
  const priceCents = face.kind === 'cancelled' ? null : event.priceCents;

  const countdown =
    face.kind === 'presale' ? <TicketPanelCountdown targetIso={face.presaleStartsAt} /> : null;

  const availability =
    face.kind === 'tickets' ? <TicketPanelAvailability event={event} scarce={face.scarce} /> : null;

  const noteLine = note === null ? null : <TicketPanelNote>{note}</TicketPanelNote>;

  return (
    <TicketPanelShell>
      <TicketPanelPrice priceCents={priceCents} />
      {countdown}
      {availability}
      {noteLine}
      {action}
    </TicketPanelShell>
  );
};
