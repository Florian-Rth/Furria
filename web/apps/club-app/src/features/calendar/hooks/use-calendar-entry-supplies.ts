import { useGroupsQuery } from '@/features/groups';
import { useRunningVenuesQuery } from '../api';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toParticipantPool } from '../calendar-authoring';
import type { RunningVenue } from '../schemas';

export interface CalendarEntrySupplies {
  clubGroups: CalendarParticipantPool;
  venues: readonly RunningVenue[];
}

export interface CalendarEntrySuppliesLoad {
  supplies: CalendarEntrySupplies | null;
  error: Error | null;
  retry: () => void;
}

export const useCalendarEntrySupplies = (): CalendarEntrySuppliesLoad => {
  const clubGroups = useGroupsQuery();
  const runningVenues = useRunningVenuesQuery();

  const retry = (): void => {
    if (runningVenues.isError) {
      void runningVenues.refetch();
    }
  };

  if (runningVenues.data === undefined || clubGroups.isPending) {
    return { supplies: null, error: runningVenues.error, retry };
  }

  return {
    supplies: {
      clubGroups: toParticipantPool(clubGroups.data?.groups),
      venues: runningVenues.data.venues,
    },
    error: null,
    retry,
  };
};
