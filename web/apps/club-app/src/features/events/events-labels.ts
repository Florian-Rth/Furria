import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { toIsoDayLabel, toLocalIsoDay, toTimeSpanLabel } from '@/lib/calendar-days';
import type { TicketAvailabilityKey } from '@/lib/event-copy';
import { TICKET_AVAILABILITY_LABELS, toPresaleStartLabel } from '@/lib/event-copy';
import type { EventDetails, EventSummary } from './schemas';

export const EVENT_MANAGE_TITLE = 'Bild, Absage, Löschen';

export const EVENT_SECTION_TITLES = {
  picture: 'Bild',
} as const;

export const EVENT_NOT_FOUND = {
  title: 'DIESE VERANSTALTUNG GIBT ES NICHT',
  description: 'Die Veranstaltung wurde gelöscht oder hat nie existiert.',
} as const;

const LABEL_SEPARATOR = ' · ';
const NO_VENUE_LABEL = 'Ohne Ort';

export interface EventMoment {
  startsAt: string;
  endsAt: string | null;
}

export const toEventWhenLabel = (event: EventMoment): string =>
  `${toIsoDayLabel(toLocalIsoDay(event.startsAt))}, ${toTimeSpanLabel(event.startsAt, event.endsAt)}`;

export const toEventRowMeta = (
  event: Pick<EventSummary, 'startsAt' | 'endsAt' | 'venueName'>,
): string =>
  [toTimeSpanLabel(event.startsAt, event.endsAt), event.venueName ?? NO_VENUE_LABEL].join(
    LABEL_SEPARATOR,
  );

export const toClockLabel = (clockTime: string | null): string | null =>
  clockTime === null ? null : `${clockTime} Uhr`;

export type AvailabilityState = 'settable' | 'beforePresale' | 'cancelled';

const SETTABLE_STATUSES: ReadonlySet<EventDetails['status']> = new Set([
  'available',
  'fewLeft',
  'soldOut',
]);

export const toAvailabilityState = (event: Pick<EventDetails, 'status'>): AvailabilityState => {
  if (event.status === 'cancelled') {
    return 'cancelled';
  }

  return SETTABLE_STATUSES.has(event.status) ? 'settable' : 'beforePresale';
};

export const AVAILABILITY_NOTES: Record<Exclude<AvailabilityState, 'settable'>, string> = {
  beforePresale: 'Die Kartenlage lässt sich ab dem Start des Vorverkaufs setzen.',
  cancelled: 'Abgesagt — die Website zeigt keine Kartenlage, nur die Absage.',
};

export const toEventFacts = (event: EventDetails): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Veranstaltung', value: event.title },
    { label: 'Wann', value: toEventWhenLabel(event) },
  ];

  if (event.venueName !== null) {
    facts.push({ label: 'Ort', value: event.venueName });
  }

  return facts;
};

export const toPresaleLine = (presaleStartsAt: string | null): string =>
  presaleStartsAt === null ? 'Noch nicht festgelegt' : `Ab ${toPresaleStartLabel(presaleStartsAt)}`;

export const toEventCreatedMessage = (title: string): string =>
  `„${title}“ ist angelegt und in Vorbereitung.`;

export const toEventPublishedMessage = (title: string): string =>
  `„${title}“ steht jetzt auf der Website.`;

export const toEventSavedMessage = (title: string): string => `„${title}“ ist gespeichert.`;

export const toEventCancelledMessage = (title: string): string =>
  `„${title}“ ist abgesagt. Die Website zeigt die Absage.`;

export const toEventRestoredMessage = (title: string): string => `„${title}“ findet wieder statt.`;

export const toEventDeletedMessage = (title: string): string => `„${title}“ ist gelöscht.`;

export const toTicketAvailabilityMessage = (
  title: string,
  ticketAvailability: TicketAvailabilityKey,
): string => `${title}: ${TICKET_AVAILABILITY_LABELS[ticketAvailability]}.`;

export interface EventCancellationCopy {
  tone: 'neutral' | 'danger';
  lineLabel: string;
  question: string;
  explanation: string;
  consequence: string;
  confirmLabel: string;
}

export const toEventCancellationCopy = (event: EventDetails): EventCancellationCopy =>
  event.cancelledAt === null
    ? {
        tone: 'danger',
        lineLabel: 'Absagen',
        question: `„${event.title}“ absagen?`,
        explanation:
          'Die Veranstaltung bleibt auf der Website stehen und zeigt die Absage, damit geteilte Links und Flyer ehrlich bleiben.',
        consequence: `Die Website zeigt „${event.title}“ ab sofort als abgesagt.`,
        confirmLabel: 'Absagen',
      }
    : {
        tone: 'neutral',
        lineLabel: 'Absage zurücknehmen',
        question: `Findet „${event.title}“ doch statt?`,
        explanation: 'Die Website zeigt die Veranstaltung wieder mit ihrer Kartenlage.',
        consequence: `Die Absage von „${event.title}“ ist danach aufgehoben.`,
        confirmLabel: 'Absage zurücknehmen',
      };

export const DELETE_EVENT_LABEL = 'Veranstaltung löschen';
export const DELETE_EVENT_EXPLANATION =
  'Löschen ist für eine versehentlich angelegte Veranstaltung. Ihre Seite auf der Website verschwindet. Fällt der Abend aus, sage ihn stattdessen ab.';

export const toDeleteEventQuestion = (title: string): string => `„${title}“ löschen?`;

export const toDeleteEventConsequence = (title: string): string =>
  `„${title}“ verschwindet endgültig aus der Website und dem Kalender.`;
