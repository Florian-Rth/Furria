import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { ActGroup } from '@/features/running-order/schemas';
import { GROUPS_ORIGIN, START_ORIGIN } from '@/features/session/app-sections';

export const PASS_ACT_PATH = '/lab/act-a/$actId';
export const PASS_GROUP_PATH = '/lab/act-a/group/$groupId';
export const EVENT_PATH = '/events/$eventId';
export const CALENDAR_PATH = '/calendar';
export const PLAYER_PATH = '/acts/$actId';
export const GROUP_HUB_PATH = '/groups/$groupId';

export interface PassLink {
  to: string;
  params: Record<string, string>;
  search?: Record<string, number>;
}

export const passActLinkOf = (actId: number): PassLink => ({
  to: PASS_ACT_PATH,
  params: { actId: String(actId) },
});

export const eveningLinkOf = (eventId: number): PassLink => ({
  to: EVENT_PATH,
  params: { eventId: String(eventId) },
});

export const trainingLinkOf = (calendarEntryId: number): PassLink => ({
  to: CALENDAR_PATH,
  params: {},
  search: { entry: calendarEntryId },
});

export const playerLinkOf = (actId: number): PassLink => ({
  to: PLAYER_PATH,
  params: { actId: String(actId) },
});

export const groupHubLinkOf = (groupId: number): PassLink => ({
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});

export const passActOriginOf = (group: ActGroup | null): KkScreenOrigin =>
  group === null
    ? START_ORIGIN
    : { label: group.name, to: PASS_GROUP_PATH, params: { groupId: String(group.groupId) } };

export const PASS_GROUP_ORIGIN: KkScreenOrigin = GROUPS_ORIGIN;
