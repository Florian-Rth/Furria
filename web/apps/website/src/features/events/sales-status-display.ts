import { formatNumericDate, formatShortDate } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/seed/events';

export type SalesUrgency = 'upcoming' | 'open' | 'scarce' | 'exhausted' | 'cancelled';

const URGENCY_BY_STATUS: Record<SalesStatus, SalesUrgency> = {
  announced: 'upcoming',
  presaleScheduled: 'upcoming',
  onSale: 'open',
  almostSoldOut: 'scarce',
  soldOut: 'exhausted',
  salesClosed: 'exhausted',
  cancelled: 'cancelled',
};

export const deriveSalesUrgency = (status: SalesStatus): SalesUrgency => URGENCY_BY_STATUS[status];

export type SalesUrgencyColor = 'default' | 'error' | 'info' | 'success' | 'warning';

const COLOR_BY_URGENCY: Record<SalesUrgency, SalesUrgencyColor> = {
  upcoming: 'info',
  open: 'success',
  scarce: 'warning',
  exhausted: 'default',
  cancelled: 'error',
};

export const deriveSalesUrgencyColor = (status: SalesStatus): SalesUrgencyColor =>
  COLOR_BY_URGENCY[deriveSalesUrgency(status)];

export type CapacityBarColor = 'success' | 'warning';

export const isLiveSaleStatus = (status: SalesStatus): boolean =>
  status === 'onSale' || status === 'almostSoldOut';

export const deriveCapacityBarColor = (status: SalesStatus): CapacityBarColor =>
  status === 'almostSoldOut' ? 'warning' : 'success';

const presaleStartLong = (presaleStartsAt: string): string =>
  `Vorverkauf ab ${formatNumericDate(presaleStartsAt)}`;

const presaleStartShort = (presaleStartsAt: string): string =>
  `Ab ${formatShortDate(presaleStartsAt)}`;

const freeSeatsLong = (event: Event): string =>
  event.freeCount !== null && event.capacity !== null
    ? `${event.freeCount} von ${event.capacity} frei`
    : 'Vorverkauf läuft';

const freeSeatsShort = (event: Event): string =>
  event.freeCount !== null ? `${event.freeCount} frei` : 'Offen';

export const deriveSalesStatusLabel = (event: Event): string => {
  switch (event.salesStatus) {
    case 'announced':
      return 'Vorverkauf folgt';
    case 'presaleScheduled':
      return event.presaleStartsAt !== null
        ? presaleStartLong(event.presaleStartsAt)
        : 'Vorverkauf folgt';
    case 'onSale':
    case 'almostSoldOut':
      return freeSeatsLong(event);
    case 'soldOut':
      return 'Ausverkauft';
    case 'salesClosed':
      return 'Vorverkauf beendet';
    case 'cancelled':
      return 'Abgesagt';
  }
};

export const deriveSalesShortLabel = (event: Event): string => {
  switch (event.salesStatus) {
    case 'announced':
      return 'Bald';
    case 'presaleScheduled':
      return event.presaleStartsAt !== null ? presaleStartShort(event.presaleStartsAt) : 'Bald';
    case 'onSale':
    case 'almostSoldOut':
      return freeSeatsShort(event);
    case 'soldOut':
      return 'Ausverkauft';
    case 'salesClosed':
      return 'Verkauf beendet';
    case 'cancelled':
      return 'Abgesagt';
  }
};
