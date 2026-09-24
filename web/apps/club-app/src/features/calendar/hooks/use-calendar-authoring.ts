import { useMyGroupsQuery } from '@/features/group-hub';
import { useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { CalendarOwnerOption } from '../calendar-authoring';
import { mayOwnCalendarEntry, toOwnerOptions } from '../calendar-authoring';
import type { CalendarEntry } from '../schemas';

export interface CalendarAuthoring {
  ownerOptions: readonly CalendarOwnerOption[];
  mayAuthor: boolean;
  mayOwn: (entry: CalendarEntry) => boolean;
}

export interface CalendarAuthoringLoad {
  authoring: CalendarAuthoring | null;
  error: Error | null;
  retry: () => void;
}

export const useCalendarAuthoring = (): CalendarAuthoringLoad => {
  const me = useMeQuery();
  const { has, isUndecided } = usePermissions();
  const myGroups = useMyGroupsQuery();

  const retry = (): void => {
    if (me.isError) {
      void me.refetch();
    }
    if (myGroups.isError) {
      void myGroups.refetch();
    }
  };

  if (isUndecided || myGroups.data === undefined) {
    return { authoring: null, error: me.error ?? myGroups.error, retry };
  }

  const ownerOptions = toOwnerOptions(
    myGroups.data.groups,
    has(PERMISSION_KEYS.calendarManageClub),
  );

  return {
    authoring: {
      ownerOptions,
      mayAuthor: ownerOptions.length > 0,
      mayOwn: (entry) => mayOwnCalendarEntry(ownerOptions, entry.ownerGroupId),
    },
    error: null,
    retry,
  };
};
