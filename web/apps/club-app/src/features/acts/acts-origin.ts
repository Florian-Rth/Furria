import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { ActsScope } from './acts-catalogue';

export const CLUB_SCOPE: ActsScope = { kind: 'club' };

export const PLANNER_PATH = '/events/$eventId/ablauf';
export const GROUP_HUB_PATH = '/groups/$groupId';

export const plannerOriginOf = (eventId: number): KkScreenOrigin => ({
  label: 'Ablauf',
  to: PLANNER_PATH,
  params: { eventId: String(eventId) },
  search: { mode: 'pick' },
});

export const groupOriginOf = (groupId: number, name: string): KkScreenOrigin => ({
  label: name,
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});
