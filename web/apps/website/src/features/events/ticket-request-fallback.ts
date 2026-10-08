import { formatClockTime, formatNumericDate } from '@/lib/date';
import type { Event } from '@/lib/public-events/schemas';
import type { TicketRequestForm } from './schemas';

const FALLBACK_INTRO =
  'Die Kartenanfrage ließ sich auf der Website nicht absenden. Hier sind die Angaben:';

const toEventMoment = (event: Pick<Event, 'startsAt'>): string =>
  `${formatNumericDate(event.startsAt)}, ${formatClockTime(event.startsAt)} Uhr`;

export const buildTicketRequestFallbackHref = (
  clubEmail: string,
  event: Pick<Event, 'title' | 'startsAt'>,
  values: TicketRequestForm,
): string => {
  const entries: [string, string][] = [
    ['Veranstaltung', event.title],
    ['Termin', toEventMoment(event)],
    ['Karten', String(values.ticketCount)],
    ['Name', values.name],
    ['Telefon', values.phone],
    ['E-Mail', values.email],
    ['Nachricht', values.message],
    ['Datenschutzhinweise gelesen', values.consent ? 'ja' : ''],
  ];

  const lines = entries
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`);

  const subject = `Kartenanfrage – ${event.title} – ${values.ticketCount} Karten`;
  const body = [FALLBACK_INTRO, '', ...lines].join('\n');

  return `mailto:${clubEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
