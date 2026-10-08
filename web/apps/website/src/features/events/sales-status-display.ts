import { formatNumericDate } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';

type SalesUrgency = 'upcoming' | 'open' | 'scarce' | 'exhausted' | 'cancelled';

const URGENCY_BY_STATUS: Record<SalesStatus, SalesUrgency> = {
  announced: 'upcoming',
  presaleScheduled: 'upcoming',
  available: 'open',
  fewLeft: 'scarce',
  soldOut: 'exhausted',
  cancelled: 'cancelled',
};

type SalesUrgencyColor = 'default' | 'error' | 'info' | 'success' | 'warning';

const COLOR_BY_URGENCY: Record<SalesUrgency, SalesUrgencyColor> = {
  upcoming: 'info',
  open: 'success',
  scarce: 'warning',
  exhausted: 'default',
  cancelled: 'error',
};

export const deriveSalesUrgencyColor = (status: SalesStatus): SalesUrgencyColor =>
  COLOR_BY_URGENCY[URGENCY_BY_STATUS[status]];

type SalesFacts = Pick<Event, 'status' | 'presaleStartsAt'>;

export const deriveSalesStatusLabel = ({ status, presaleStartsAt }: SalesFacts): string => {
  switch (status) {
    case 'announced':
      return 'Vorverkauf folgt';
    case 'presaleScheduled':
      return presaleStartsAt === null
        ? 'Vorverkauf folgt'
        : `Vorverkauf ab ${formatNumericDate(presaleStartsAt)}`;
    case 'available':
      return 'Karten verfügbar';
    case 'fewLeft':
      return 'Nur noch wenige Karten';
    case 'soldOut':
      return 'Ausverkauft';
    case 'cancelled':
      return 'Abgesagt';
  }
};
