import type { FC } from 'react';
import { derivePresalePlaces } from '@/features/events/presale-places-display';
import {
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from '@/features/events/ticket-panel-display';
import type { EventDetail } from '@/lib/public-events/schemas';
import { TicketPanelShell } from './internal/layout/TicketPanelShell';
import { TicketPanelAvailability } from './internal/ui/TicketPanelAvailability';
import { TicketPanelCountdown } from './internal/ui/TicketPanelCountdown';
import { TicketPanelNote } from './internal/ui/TicketPanelNote';
import { TicketPanelPlaces } from './internal/ui/TicketPanelPlaces';
import { TicketPanelPrice } from './internal/ui/TicketPanelPrice';

interface EventTicketPanelProps {
  event: EventDetail;
}

export const EventTicketPanel: FC<EventTicketPanelProps> = ({ event }) => {
  const face = deriveTicketPanelFace(event);
  const note = deriveTicketPanelNote(face);
  const presalePlaces = derivePresalePlaces(event);
  const priceCents = face.kind === 'cancelled' ? null : event.priceCents;

  const countdown =
    face.kind === 'presale' ? <TicketPanelCountdown targetIso={face.presaleStartsAt} /> : null;

  const availability =
    face.kind === 'tickets' ? <TicketPanelAvailability event={event} scarce={face.scarce} /> : null;

  const noteLine = note === null ? null : <TicketPanelNote>{note}</TicketPanelNote>;

  const placesBlock =
    presalePlaces === null ? null : <TicketPanelPlaces presalePlaces={presalePlaces} />;

  return (
    <TicketPanelShell>
      <TicketPanelPrice priceCents={priceCents} />
      {countdown}
      {availability}
      {noteLine}
      {placesBlock}
    </TicketPanelShell>
  );
};
