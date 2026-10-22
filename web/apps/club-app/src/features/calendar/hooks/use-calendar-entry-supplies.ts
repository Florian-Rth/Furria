import { useGroupsQuery } from '@/features/groups/api';
import { useRunningVenuesQuery } from '../api';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toParticipantPool } from '../calendar-authoring';
import type { RunningVenue } from '../schemas';

export interface CalendarEntryReload {
  retry: () => void;
  isRetrying: boolean;
}

export interface CalendarEntrySupplies {
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload;
  venues: readonly RunningVenue[];
}

export interface CalendarEntrySuppliesLoad {
  supplies: CalendarEntrySupplies | null;
  error: Error | null;
  isRetrying: boolean;
  retry: () => void;
}

export const useCalendarEntrySupplies = (): CalendarEntrySuppliesLoad => {
  const clubGroups = useGroupsQuery();
  const runningVenues = useRunningVenuesQuery();
  const isRetrying = runningVenues.isFetching || clubGroups.isFetching;

  const retryClubGroups = (): void => {
    if (clubGroups.isError) {
      void clubGroups.refetch();
    }
  };

  const retry = (): void => {
    if (runningVenues.isError) {
      void runningVenues.refetch();
    }
    retryClubGroups();
  };

  if (runningVenues.data === undefined || clubGroups.isPending) {
    return { supplies: null, error: runningVenues.error, isRetrying, retry };
  }

  return {
    supplies: {
      clubGroups: toParticipantPool(clubGroups.data?.groups),
      clubGroupsReload: { retry: retryClubGroups, isRetrying: clubGroups.isFetching },
      venues: runningVenues.data.venues,
    },
    error: null,
    isRetrying,
    retry,
  };
};
