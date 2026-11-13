import type { AddOnHost, AddOnHostKind, CalendarEntry } from './schemas';

export interface AddOnAnswering {
  host: AddOnHost;
  mayAnswer: boolean;
}

const ADD_ON_ROUTE_ROOTS: Record<AddOnHostKind, string> = {
  calendarEntry: '/api/calendar',
  announcement: '/api/announcements',
};

export const toAddOnRouteRoot = (hostKind: AddOnHostKind): string => ADD_ON_ROUTE_ROOTS[hostKind];

export const toReminderPath = (host: AddOnHost): string =>
  host.kind === 'calendarEntry'
    ? `/api/calendar/entries/${host.calendarEntryId}/reminders`
    : `/api/announcements/${host.announcementId}/reminders`;

export const toEntryHost = (entry: Pick<CalendarEntry, 'calendarEntryId'>): AddOnHost => ({
  kind: 'calendarEntry',
  calendarEntryId: entry.calendarEntryId,
});

export const toEntryAnswering = (
  entry: Pick<CalendarEntry, 'calendarEntryId' | 'mayAnswer'>,
): AddOnAnswering => ({ host: toEntryHost(entry), mayAnswer: entry.mayAnswer });
