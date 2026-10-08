import type { KkChipTone } from '@furria/ui';
import { toDayNumberLabel, toLocalIsoDay, toTimeLabel } from './calendar-days';
import { formatIsoDay } from './membership-labels';

export const EVENT_SALES_STATUS_KEYS = [
  'announced',
  'presaleScheduled',
  'available',
  'fewLeft',
  'soldOut',
  'cancelled',
] as const;
export type EventSalesStatusKey = (typeof EVENT_SALES_STATUS_KEYS)[number];

export const TICKET_AVAILABILITY_KEYS = ['available', 'fewLeft', 'soldOut'] as const;
export type TicketAvailabilityKey = (typeof TICKET_AVAILABILITY_KEYS)[number];

export const TICKET_AVAILABILITY_LABELS: Record<TicketAvailabilityKey, string> = {
  available: 'Karten verfügbar',
  fewLeft: 'Nur noch wenige Karten',
  soldOut: 'Ausverkauft',
};

export const EVENT_STATUS_TONES: Record<EventSalesStatusKey, KkChipTone> = {
  announced: 'neutral',
  presaleScheduled: 'blue',
  available: 'green',
  fewLeft: 'gold',
  soldOut: 'ink',
  cancelled: 'accent',
};

const SHORT_STATUS_LABELS: Record<Exclude<EventSalesStatusKey, 'presaleScheduled'>, string> = {
  announced: 'Angekündigt',
  available: 'Verfügbar',
  fewLeft: 'Nur noch wenige',
  soldOut: 'Ausverkauft',
  cancelled: 'Abgesagt',
};

const STATUS_LABELS: Record<Exclude<EventSalesStatusKey, 'presaleScheduled'>, string> = {
  announced: 'Vorverkauf wird noch angekündigt',
  available: TICKET_AVAILABILITY_LABELS.available,
  fewLeft: TICKET_AVAILABILITY_LABELS.fewLeft,
  soldOut: TICKET_AVAILABILITY_LABELS.soldOut,
  cancelled: 'Abgesagt',
};

const CLOCK_SUFFIX = ' Uhr';
const CENTS_PER_EURO = 100;
const CENT_DIGITS = 2;
const FREE_ENTRY_LABEL = 'Eintritt frei';

export interface EventSales {
  status: EventSalesStatusKey;
  presaleStartsAt: string | null;
}

export const toPresaleStartLabel = (presaleStartsAt: string): string =>
  `${formatIsoDay(toLocalIsoDay(presaleStartsAt))}, ${toTimeLabel(presaleStartsAt)}${CLOCK_SUFFIX}`;

export type EventStatusVariant =
  | { kind: Exclude<EventSalesStatusKey, 'presaleScheduled'> }
  | { kind: 'presaleScheduled'; presaleStartsAt: string };

export const toEventStatusVariant = (sales: EventSales): EventStatusVariant => {
  if (sales.status !== 'presaleScheduled') {
    return { kind: sales.status };
  }
  if (sales.presaleStartsAt === null) {
    return { kind: 'announced' };
  }

  return { kind: 'presaleScheduled', presaleStartsAt: sales.presaleStartsAt };
};

export const toEventStatusLabel = (sales: EventSales): string => {
  const variant = toEventStatusVariant(sales);

  if (variant.kind === 'presaleScheduled') {
    return `Vorverkauf startet am ${toPresaleStartLabel(variant.presaleStartsAt)}`;
  }

  return STATUS_LABELS[variant.kind];
};

export const toEventStatusShortLabel = (sales: EventSales): string => {
  const variant = toEventStatusVariant(sales);

  if (variant.kind === 'presaleScheduled') {
    return `VVK ab ${toDayNumberLabel(variant.presaleStartsAt)}`;
  }

  return SHORT_STATUS_LABELS[variant.kind];
};

export const formatPriceCents = (priceCents: number): string => {
  if (priceCents === 0) {
    return FREE_ENTRY_LABEL;
  }

  const euros = Math.floor(priceCents / CENTS_PER_EURO);
  const cents = String(priceCents % CENTS_PER_EURO).padStart(CENT_DIGITS, '0');

  return `${euros},${cents} €`;
};

export const toDoorsOpenLabel = (doorsOpenAt: string): string =>
  `Einlass ${doorsOpenAt}${CLOCK_SUFFIX}`;
