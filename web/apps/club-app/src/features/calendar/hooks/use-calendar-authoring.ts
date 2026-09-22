import type { MyGroupSummary } from '@/features/group-hub';
import { useMyGroupsQuery } from '@/features/group-hub';
import { useGroupsQuery } from '@/features/groups';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRunningVenuesQuery } from '../api';
import type { CalendarOwnerOption, CalendarParticipantPool } from '../calendar-authoring';
import { mayOwnCalendarEntry, toOwnerOptions, toParticipantPool } from '../calendar-authoring';
import type { CalendarEntry, RunningVenue } from '../schemas';

const NO_GROUPS: readonly MyGroupSummary[] = [];
const NO_VENUES: readonly RunningVenue[] = [];

export interface CalendarAuthoring {
  ownerOptions: readonly CalendarOwnerOption[];
  clubGroups: CalendarParticipantPool;
  venues: readonly RunningVenue[];
  mayAuthor: boolean;
  mayOwn: (entry: CalendarEntry) => boolean;
  isLoading: boolean;
}

export const useCalendarAuthoring = (): CalendarAuthoring => {
  const { has } = usePermissions();
  const myGroups = useMyGroupsQuery();
  const clubGroups = useGroupsQuery();
  const runningVenues = useRunningVenuesQuery();

  const groups = myGroups.data?.groups ?? NO_GROUPS;
  const ownerOptions = toOwnerOptions(groups, has(PERMISSION_KEYS.calendarManageClub));

  return {
    ownerOptions,
    clubGroups: toParticipantPool(clubGroups.data?.groups, clubGroups.isError),
    venues: runningVenues.data?.venues ?? NO_VENUES,
    mayAuthor: ownerOptions.length > 0,
    mayOwn: (entry) => mayOwnCalendarEntry(ownerOptions, entry.ownerGroupId),
    isLoading: myGroups.isLoading || runningVenues.isLoading,
  };
};
