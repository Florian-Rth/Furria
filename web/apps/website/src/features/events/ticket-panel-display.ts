import { formatClockTime, formatNumericDate } from '@/lib/date';
import type { Event } from '@/lib/public-events/schemas';
import { ticketPanelNotes } from './event-detail-content';

export type TicketPanelFace =
  | { kind: 'announced' }
  | { kind: 'presale'; presaleStartsAt: string }
  | { kind: 'tickets'; scarce: boolean }
  | { kind: 'soldOut' }
  | { kind: 'cancelled' };

export const deriveTicketPanelFace = (event: Event): TicketPanelFace => {
  switch (event.status) {
    case 'announced':
      return { kind: 'announced' };
    case 'presaleScheduled':
      return event.presaleStartsAt === null
        ? { kind: 'announced' }
        : { kind: 'presale', presaleStartsAt: event.presaleStartsAt };
    case 'available':
      return { kind: 'tickets', scarce: false };
    case 'fewLeft':
      return { kind: 'tickets', scarce: true };
    case 'soldOut':
      return { kind: 'soldOut' };
    case 'cancelled':
      return { kind: 'cancelled' };
  }
};

export const deriveTicketPanelNote = (face: TicketPanelFace): string | null => {
  switch (face.kind) {
    case 'announced':
      return ticketPanelNotes.announced;
    case 'presale':
      return `${ticketPanelNotes.presalePrefix} ${formatNumericDate(face.presaleStartsAt)} um ${formatClockTime(face.presaleStartsAt)} Uhr.`;
    case 'soldOut':
      return ticketPanelNotes.soldOut;
    case 'cancelled':
      return ticketPanelNotes.cancelled;
    case 'tickets':
      return null;
  }
};
