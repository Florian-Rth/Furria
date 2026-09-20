import type { ClubVenue } from '@/features/club';
import { useClubHubQuery } from '@/features/club';
import type { MyGroupSummary } from '@/features/group-hub';
import { useMyGroupsQuery } from '@/features/group-hub';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { CalendarOwnerOption } from '../calendar-authoring';
import { mayOwnCalendarEntry, toOwnerOptions } from '../calendar-authoring';
import type { CalendarEntry } from '../schemas';

const NO_GROUPS: readonly MyGroupSummary[] = [];
const NO_VENUES: readonly ClubVenue[] = [];

export interface CalendarAuthoring {
  ownerOptions: readonly CalendarOwnerOption[];
  venues: readonly ClubVenue[];
  mayAuthor: boolean;
  mayOwn: (entry: CalendarEntry) => boolean;
}

export const useCalendarAuthoring = (): CalendarAuthoring => {
  const { has } = usePermissions();
  const myGroups = useMyGroupsQuery();
  const clubHub = useClubHubQuery();

  const groups = myGroups.data?.groups ?? NO_GROUPS;
  const ownerOptions = toOwnerOptions(groups, has(PERMISSION_KEYS.calendarManageClub));

  return {
    ownerOptions,
    venues: clubHub.data?.venues ?? NO_VENUES,
    mayAuthor: ownerOptions.length > 0,
    mayOwn: (entry) => mayOwnCalendarEntry(ownerOptions, entry.ownerGroupId),
  };
};
