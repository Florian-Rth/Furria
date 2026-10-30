import type { KkScreenOrigin } from '@furria/ui/screen-declaration';

export const LAB_PATH = '/lab';
export const LAB_ACT_PATH = '/lab/act-c/$actId';
export const LAB_GROUP_PATH = '/lab/act-c/group/$groupId';
export const PLAYER_PATH = '/acts/$actId';
export const GROUP_HUB_PATH = '/groups/$groupId';
export const EVENT_PATH = '/events/$eventId';
export const CALENDAR_ENTRY_PATH = '/calendar/$calendarEntryId';

export interface LabLink {
  to: string;
  params: Record<string, string>;
  search?: Record<string, string | boolean>;
}

export const labGroupOriginOf = (groupId: number, name: string): KkScreenOrigin => ({
  label: name,
  to: LAB_GROUP_PATH,
  params: { groupId: String(groupId) },
});

export const labActLinkOf = (actId: number): LabLink => ({
  to: LAB_ACT_PATH,
  params: { actId: String(actId) },
});

export const playerLinkOf = (actId: number): LabLink => ({
  to: PLAYER_PATH,
  params: { actId: String(actId) },
});

export const studioEditLinkOf = (actId: number): LabLink => ({
  to: PLAYER_PATH,
  params: { actId: String(actId) },
  search: { edit: true },
});

export const actDetailsLinkOf = (actId: number, settings: boolean): LabLink => ({
  to: PLAYER_PATH,
  params: { actId: String(actId) },
  search: settings ? { view: 'details', settings: true } : { view: 'details' },
});

export const eventLinkOf = (eventId: number): LabLink => ({
  to: EVENT_PATH,
  params: { eventId: String(eventId) },
});

export const calendarEntryLinkOf = (calendarEntryId: number): LabLink => ({
  to: CALENDAR_ENTRY_PATH,
  params: { calendarEntryId: String(calendarEntryId) },
});

export const groupHubLinkOf = (groupId: number): LabLink => ({
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});
