import { formatClockTime, formatNumericDate } from '@/lib/date';
import type { Event } from '@/lib/seed/events';
import { ticketPanelCtaLabels, ticketPanelNotes } from './event-detail-content';
import { buildExchangeHref, buildOrderFlowHref } from './event-display';
import { orderEntryCtaLabel } from './order-flow-content';

export type TicketPanelFace =
  | { kind: 'announced' }
  | { kind: 'presale'; presaleStartsAt: string }
  | { kind: 'onSale'; scarce: boolean }
  | { kind: 'soldOut' }
  | { kind: 'closed' }
  | { kind: 'cancelled' };

export type BlockedFaceKind = Exclude<TicketPanelFace['kind'], 'onSale'>;

export const deriveTicketPanelFace = (event: Event): TicketPanelFace => {
  switch (event.salesStatus) {
    case 'announced':
      return { kind: 'announced' };
    case 'presaleScheduled':
      return event.presaleStartsAt === null
        ? { kind: 'announced' }
        : { kind: 'presale', presaleStartsAt: event.presaleStartsAt };
    case 'onSale':
      return { kind: 'onSale', scarce: false };
    case 'almostSoldOut':
      return { kind: 'onSale', scarce: true };
    case 'soldOut':
      return { kind: 'soldOut' };
    case 'salesClosed':
      return { kind: 'closed' };
    case 'cancelled':
      return { kind: 'cancelled' };
  }
};

export type TicketPanelCtaEmphasis = 'contained' | 'outlined';

export interface TicketPanelCta {
  label: string;
  to: string;
  emphasis: TicketPanelCtaEmphasis;
}

export const deriveTicketPanelCta = (event: Event): TicketPanelCta | null => {
  const face = deriveTicketPanelFace(event);
  if (face.kind === 'onSale') {
    return {
      label: orderEntryCtaLabel,
      to: buildOrderFlowHref(event.id),
      emphasis: 'contained',
    };
  }
  if (face.kind === 'soldOut') {
    return {
      label: ticketPanelCtaLabels.exchange,
      to: buildExchangeHref(),
      emphasis: 'outlined',
    };
  }
  return null;
};

export const deriveTicketPanelNote = (face: TicketPanelFace): string | null => {
  switch (face.kind) {
    case 'announced':
      return ticketPanelNotes.announced;
    case 'presale':
      return `${ticketPanelNotes.presalePrefix} ${formatNumericDate(face.presaleStartsAt)} um ${formatClockTime(face.presaleStartsAt)} Uhr.`;
    case 'soldOut':
      return ticketPanelNotes.soldOut;
    case 'closed':
      return ticketPanelNotes.closed;
    case 'cancelled':
      return ticketPanelNotes.cancelled;
    case 'onSale':
      return null;
  }
};
