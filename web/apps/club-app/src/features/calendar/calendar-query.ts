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

const GROUP_SCOPE_PREFIX = 'group-';
const GROUP_SCOPE_PATTERN = /^group-([1-9]\d*)$/;
const CALENDAR_ENDPOINT = '/api/calendar';

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
