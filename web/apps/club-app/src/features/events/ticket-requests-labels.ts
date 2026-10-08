import type { KkConfirmFact } from '@furria/ui';
import type { ToDoMark } from '@/features/to-dos/to-do-board';
import { withToDoMark } from '@/features/to-dos/to-do-board';
import { toDayNumberLabel, toIsoDayLabel, toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import type { TicketRequest, TicketRequestsResponse } from './schemas';

export const TICKET_REQUESTS_PANEL_TITLE = 'Kartenanfragen';
export const EVENT_REQUESTS_PANEL_TITLE = 'Anfragen';
export const TICKET_REQUESTS_EMPTY_NOTE =
  'Keine offenen Kartenanfragen. Neue kommen über die Seiten der Veranstaltungen auf der Website.';
export const EVENT_REQUESTS_EMPTY_NOTE = 'Für diesen Abend ist keine Anfrage offen.';

export const HANDLE_REQUEST_LABEL = 'Erledigt';
export const HANDLE_REQUEST_EYEBROW = 'Kartenanfrage erledigen';
export const HANDLE_REQUEST_EXPLANATION =
  'Erledigt ist eine Anfrage, wenn du dich gemeldet hast und die Karten geklärt sind. Die App schreibt dem Gast nichts — das tust du selbst.';
export const HANDLE_REQUEST_CONSEQUENCE =
  'Die Anfrage wird gelöscht. Der Verein hebt keine Liste der Anfragen auf.';

const SINGLE = 1;
const SEPARATOR = ' · ';
const CLOCK_SUFFIX = ' Uhr';

export interface TicketRequestGroup {
  eventId: number;
  eventTitle: string;
  eventStartsAt: string;
  requests: TicketRequest[];
}

const toEmptyGroup = (request: TicketRequest): TicketRequestGroup => ({
  eventId: request.eventId,
  eventTitle: request.eventTitle,
  eventStartsAt: request.eventStartsAt,
  requests: [],
});

export const groupTicketRequests = (requests: readonly TicketRequest[]): TicketRequestGroup[] => {
  const groups = new Map<number, TicketRequestGroup>();

  for (const request of requests) {
    const group = groups.get(request.eventId) ?? toEmptyGroup(request);
    groups.set(request.eventId, { ...group, requests: [...group.requests, request] });
  }

  return [...groups.values()];
};

export const requestsOfEvent = (
  requests: readonly TicketRequest[],
  eventId: number,
): TicketRequest[] => requests.filter((request) => request.eventId === eventId);

export interface RequestsTotals {
  requestCount: number;
  ticketCount: number;
}

export const toRequestsTotals = (requests: readonly TicketRequest[]): RequestsTotals => ({
  requestCount: requests.length,
  ticketCount: requests.reduce((sum, request) => sum + request.ticketCount, 0),
});

export const toTicketUnitLabel = (ticketCount: number): string =>
  ticketCount === SINGLE ? 'Karte' : 'Karten';

const toTicketCountLabel = (ticketCount: number): string =>
  `${ticketCount} ${toTicketUnitLabel(ticketCount)}`;

const toRequestCountLabel = (requestCount: number): string =>
  requestCount === SINGLE ? '1 Anfrage' : `${requestCount} Anfragen`;

export const toRequestsTally = (requests: readonly TicketRequest[]): string => {
  const totals = toRequestsTotals(requests);

  return [toRequestCountLabel(totals.requestCount), toTicketCountLabel(totals.ticketCount)].join(
    SEPARATOR,
  );
};

export const toRequestedAtLabel = (request: TicketRequest): string =>
  `Eingegangen ${toDayNumberLabel(request.requestedAt)}, ${toTimeLabel(request.requestedAt)}${CLOCK_SUFFIX}`;

const toEventStartLabel = (startsAt: string): string =>
  `${toIsoDayLabel(toLocalIsoDay(startsAt))}, ${toTimeLabel(startsAt)}${CLOCK_SUFFIX}`;

const NOT_DIALABLE = /[^\d+]/g;

export const toPhoneHref = (phone: string): string => `tel:${phone.replace(NOT_DIALABLE, '')}`;

export const toMailHref = (email: string): string => `mailto:${email}`;

export const toQuotedMessage = (message: string): string => `„${message}“`;

export const toHandleRequestQuestion = (request: TicketRequest): string =>
  `Ist die Anfrage von ${request.name} erledigt?`;

export const toTicketRequestFacts = (request: TicketRequest): KkConfirmFact[] => [
  { label: 'Veranstaltung', value: request.eventTitle },
  { label: 'Wann', value: toEventStartLabel(request.eventStartsAt) },
  { label: 'Karten', value: String(request.ticketCount) },
  { label: 'Telefon', value: request.phone },
  { label: 'E-Mail', value: request.email },
];

export const toRequestHandledMessage = (request: TicketRequest): string =>
  `Die Anfrage von ${request.name} ist erledigt.`;

export const REQUEST_ALREADY_HANDLED_MESSAGE =
  'Diese Anfrage hat inzwischen schon jemand erledigt.';

export const withTicketRequestToDoMark = (
  current: TicketRequestsResponse | undefined,
  mark: ToDoMark,
): TicketRequestsResponse | undefined =>
  current === undefined || current.toDo === null
    ? current
    : { ...current, toDo: withToDoMark(current.toDo, mark) };
