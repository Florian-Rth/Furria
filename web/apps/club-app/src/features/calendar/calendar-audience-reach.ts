import type { MyGroupSummary } from '@/features/group-hub/schemas';
import type { CalendarParticipantGroup, CalendarParticipantPool } from './calendar-authoring';
import { AUDIENCE_ORDER } from './calendar-authoring';
import type { CalendarEntryAudience, ChoosablePerson } from './schemas';

export type CalendarAudienceReach =
  | { readonly scope: 'club' }
  | { readonly scope: 'everyGroup' }
  | { readonly scope: 'ownGroups'; readonly groupIds: readonly number[] };

interface CalendarSchedulingRights {
  managesClubCalendar: boolean;
  managesGroups: boolean;
}

export const toAudienceReach = (
  rights: CalendarSchedulingRights,
  groups: readonly MyGroupSummary[],
): CalendarAudienceReach => {
  if (rights.managesClubCalendar) {
    return { scope: 'club' };
  }
  if (rights.managesGroups) {
    return { scope: 'everyGroup' };
  }

  return {
    scope: 'ownGroups',
    groupIds: groups.filter((group) => group.isAdmin).map((group) => group.groupId),
  };
};

export const toOfferedAudiences = (
  reach: CalendarAudienceReach,
  heldAudience: CalendarEntryAudience | null,
): CalendarEntryAudience[] =>
  AUDIENCE_ORDER.filter(
    (audience) => audience !== 'club' || reach.scope === 'club' || heldAudience === 'club',
  );

const reachesGroup = (reach: CalendarAudienceReach, groupId: number): boolean =>
  reach.scope !== 'ownGroups' || reach.groupIds.includes(groupId);

export const toReachableGroups = <TGroup extends CalendarParticipantGroup>(
  groups: readonly TGroup[],
  reach: CalendarAudienceReach,
): TGroup[] => groups.filter((group) => reachesGroup(reach, group.groupId));

export const toReachablePool = (
  pool: CalendarParticipantPool,
  reach: CalendarAudienceReach,
): CalendarParticipantPool =>
  pool.state === 'failed'
    ? pool
    : { state: 'ready', groups: toReachableGroups(pool.groups, reach) };

export const toReachablePeople = (
  people: readonly ChoosablePerson[],
  reach: CalendarAudienceReach,
): ChoosablePerson[] =>
  reach.scope === 'club'
    ? [...people]
    : people.filter((person) => person.groupIds.some((groupId) => reachesGroup(reach, groupId)));
