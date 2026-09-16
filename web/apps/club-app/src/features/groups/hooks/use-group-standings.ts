import type { MyGroupSummary } from '@/features/group-hub';
import { useMyGroupsQuery } from '@/features/group-hub';
import type { GroupStanding } from '../groups-labels';
import { toGroupStandings } from '../groups-labels';

const NO_GROUPS: readonly MyGroupSummary[] = [];

export const useGroupStandings = (): Map<number, GroupStanding> => {
  const myGroups = useMyGroupsQuery();

  return toGroupStandings(myGroups.data?.groups ?? NO_GROUPS);
};

export const useGroupStanding = (groupId: number | undefined): GroupStanding | undefined => {
  const standings = useGroupStandings();

  return groupId === undefined ? undefined : standings.get(groupId);
};
