export type CalendarScope = 'all' | 'club' | 'group';

export interface CalendarQuery {
  scope: CalendarScope;
  groupId: number | null;
  from: string | null;
  to: string | null;
}

const CALENDAR_ENDPOINT = '/api/calendar';

export const toCalendarPath = (query: CalendarQuery): string => {
  const params = new URLSearchParams({ scope: query.scope });

  if (query.groupId !== null) {
    params.set('groupId', String(query.groupId));
  }
  if (query.from !== null) {
    params.set('from', query.from);
  }
  if (query.to !== null) {
    params.set('to', query.to);
  }

  return `${CALENDAR_ENDPOINT}?${params.toString()}`;
};
