const ACT_AGENDA_PATH = '/lab/act-b/$actId';
const GROUP_AGENDA_PATH = '/lab/act-b/group/$groupId';

export const actAgendaPathOf = (actId: number): string =>
  ACT_AGENDA_PATH.replace('$actId', String(actId));

export const groupAgendaPathOf = (groupId: number): string =>
  GROUP_AGENDA_PATH.replace('$groupId', String(groupId));

export const eveningPathOf = (eventId: number): string => `/events/${eventId}`;

export const trainingPathOf = (calendarEntryId: number): string => `/calendar/${calendarEntryId}`;

export const groupHubPathOf = (groupId: number): string => `/groups/${groupId}`;
