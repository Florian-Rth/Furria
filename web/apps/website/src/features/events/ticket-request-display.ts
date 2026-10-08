import { formatClockTime, formatLongDate, formatWeekdayAndFullDate } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/public-events/schemas';
import { FEWEST_TICKETS, MOST_TICKETS } from './schemas';

export interface TicketRequestSummaryRow {
  label: string;
  value: string;
}

export interface TicketCountChoice {
  value: number;
  label: string;
}

const SINGLE = 1;
const NOTHING_DUE = '0 €';

const toTicketCountLabel = (ticketCount: number): string =>
  ticketCount === SINGLE ? '1 Karte' : `${ticketCount} Karten`;

export const TICKET_COUNT_CHOICES: readonly TicketCountChoice[] = Array.from(
  { length: MOST_TICKETS - FEWEST_TICKETS + 1 },
  (_, index) => {
    const value = FEWEST_TICKETS + index;
    return { value, label: toTicketCountLabel(value) };
  },
);

export const buildTicketRequestEyebrow = (event: Pick<Event, 'startsAt'>): string =>
  `KARTENANFRAGE · ${formatWeekdayAndFullDate(event.startsAt).toUpperCase()}`;

export const buildTicketRequestSummaryRows = (
  event: Pick<Event, 'title' | 'startsAt' | 'venue' | 'priceCents'>,
  ticketCount: number,
): TicketRequestSummaryRow[] => {
  const rows: TicketRequestSummaryRow[] = [
    { label: 'ABEND', value: event.title },
    {
      label: 'BEGINN',
      value: `${formatWeekdayAndFullDate(event.startsAt)}, ${formatClockTime(event.startsAt)} Uhr`,
    },
    { label: 'ORT', value: event.venue.name },
    { label: 'KARTEN', value: toTicketCountLabel(ticketCount) },
  ];

  if (event.priceCents !== null) {
    rows.push({ label: 'PREIS', value: `${formatEuros(event.priceCents)} pro Karte` });
    rows.push({ label: 'ZUSAMMEN', value: formatEuros(event.priceCents * ticketCount) });
  }
  rows.push({ label: 'JETZT FÄLLIG', value: NOTHING_DUE });

  return rows;
};

export const buildTicketRequestThanksText = (
  event: Pick<Event, 'title' | 'startsAt'>,
  ticketCount: number,
  email: string,
): string =>
  `Deine Anfrage für ${toTicketCountLabel(ticketCount)} für „${event.title}“ am ${formatLongDate(event.startsAt)} ist beim Verein. Eine Bestätigung ist an ${email} unterwegs. Wir melden uns bei dir — per Telefon oder Mail.`;
