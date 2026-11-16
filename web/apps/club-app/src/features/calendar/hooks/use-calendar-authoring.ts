import { useMyGroupsQuery } from '@/features/group-hub/api';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { CalendarAudienceReach } from '../calendar-audience-reach';
import { toAudienceReach } from '../calendar-audience-reach';
import type { CalendarEntryLink, CalendarOwnerOption } from '../calendar-authoring';
import { mayOwnCalendarEntry, toEntryLink, toOwnerOptions } from '../calendar-authoring';
import type { CalendarEntry } from '../schemas';

export interface CalendarAuthoring {
  ownerOptions: readonly CalendarOwnerOption[];
  audienceReach: CalendarAudienceReach;
  mayAuthor: boolean;
  mayOwn: (entry: CalendarEntry) => boolean;
  linkOf: (entry: CalendarEntry) => CalendarEntryLink | null;
}

export interface CalendarAuthoringLoad {
  authoring: CalendarAuthoring | null;
  error: Error | null;
  isRetrying: boolean;
  retry: () => void;
}

export const useCalendarAuthoring = (): CalendarAuthoringLoad => {
  const me = useMeQuery();
  const { has, isUndecided } = usePermissions();
  const myGroups = useMyGroupsQuery();
  const isRetrying = me.isFetching || myGroups.isFetching;

  const retry = (): void => {
    if (me.isError) {
      void me.refetch();
    }
    if (myGroups.isError) {
      void myGroups.refetch();
    }
  };

  if (isUndecided || myGroups.data === undefined) {
    return { authoring: null, error: me.error ?? myGroups.error, isRetrying, retry };
  }

  const managesClubCalendar = has(PERMISSION_KEYS.calendarManageClub);
  const ownerOptions = toOwnerOptions(myGroups.data.groups, managesClubCalendar);
  const audienceReach = toAudienceReach(
    { managesClubCalendar, managesGroups: has(PERMISSION_KEYS.groupsManage) },
    myGroups.data.groups,
  );

  const mayOwn = (entry: CalendarEntry): boolean => mayOwnCalendarEntry(ownerOptions, entry);

  return {
    authoring: {
      ownerOptions,
      audienceReach,
      mayAuthor: ownerOptions.length > 0,
      mayOwn,
      linkOf: (entry) => toEntryLink(entry, mayOwn(entry)),
    },
    error: null,
    isRetrying,
    retry,
  };
};
