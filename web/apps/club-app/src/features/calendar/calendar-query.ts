export type CalendarScope = 'all' | 'club' | 'group';

export interface CalendarScopeChoice {
  scope: CalendarScope;
  groupId: number | null;
}

export interface CalendarQuery extends CalendarScopeChoice {
  from: string | null;
  to: string | null;
}

export const ALL_SCOPE_ID = 'all';
export const CLUB_SCOPE_ID = 'club';

export const ALL_CALENDAR_ENTRIES_QUERY: CalendarQuery = {
  scope: 'all',
  groupId: null,
  from: null,
  to: null,
};

const GROUP_SCOPE_PREFIX = 'group-';
const GROUP_SCOPE_PATTERN = /^group-([1-9]\d*)$/;
const CALENDAR_ENDPOINT = '/api/calendar';
const MONTH_CURSOR_PATTERN = /^(\d{4})-(\d{2})$/;
const MONTH_CURSOR_RADIX = 10;

export const toGroupScopeId = (groupId: number): string => `${GROUP_SCOPE_PREFIX}${groupId}`;

export const toScopeChoice = (scopeId: string): CalendarScopeChoice => {
  if (scopeId === CLUB_SCOPE_ID) {
    return { scope: 'club', groupId: null };
  }

  const matched = GROUP_SCOPE_PATTERN.exec(scopeId);
  const rawGroupId = matched?.[1];

  if (rawGroupId === undefined) {
    return { scope: 'all', groupId: null };
  }

  return { scope: 'group', groupId: Number(rawGroupId) };
};

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

export const toMonthCursorParam = (cursor: Date): string => {
  const month = String(cursor.getMonth() + 1).padStart(2, '0');

  return `${cursor.getFullYear()}-${month}`;
};

export const parseMonthCursorParam = (value: string | undefined, fallback: Date): Date => {
  const matched = value === undefined ? null : MONTH_CURSOR_PATTERN.exec(value);

  if (matched === null) {
    return fallback;
  }

  const year = Number.parseInt(matched[1] ?? '', MONTH_CURSOR_RADIX);
  const month = Number.parseInt(matched[2] ?? '', MONTH_CURSOR_RADIX);

  return new Date(year, month - 1, 1);
};
