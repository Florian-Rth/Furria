import type { MyGroupSummary } from '@/features/group-hub';
import { useMyGroupsQuery } from '@/features/group-hub';
import { useGroupsQuery } from '@/features/groups';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRunningVenuesQuery } from '../api';
import type { CalendarOwnerOption, CalendarParticipantGroup } from '../calendar-authoring';
import { mayOwnCalendarEntry, toOwnerOptions } from '../calendar-authoring';
import type { CalendarEntry, RunningVenue } from '../schemas';

const NO_GROUPS: readonly MyGroupSummary[] = [];
const NO_CLUB_GROUPS: readonly CalendarParticipantGroup[] = [];
const NO_VENUES: readonly RunningVenue[] = [];

export interface CalendarAuthoring {
  ownerOptions: readonly CalendarOwnerOption[];
  clubGroups: readonly CalendarParticipantGroup[];
  venues: readonly RunningVenue[];
  mayAuthor: boolean;
  mayOwn: (entry: CalendarEntry) => boolean;
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
    clubGroups: clubGroups.data?.groups ?? NO_CLUB_GROUPS,
    venues: runningVenues.data?.venues ?? NO_VENUES,
    mayAuthor: ownerOptions.length > 0,
    mayOwn: (entry) => mayOwnCalendarEntry(ownerOptions, entry.ownerGroupId),
  };
};
