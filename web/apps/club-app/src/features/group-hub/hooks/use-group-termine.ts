import { useState } from 'react';
import { sortRunningFirst } from '@/lib/calendar-days';
import { useGroupCalendarQuery } from '../api';
import { toHubErrorMessage } from '../group-hub-messages';
import { toTermineWindow } from '../group-termine';
import type { GroupCalendarEntry } from '../schemas';

const NO_ENTRIES: readonly GroupCalendarEntry[] = [];

export interface GroupTermine {
  entries: readonly GroupCalendarEntry[];
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
}

export const useGroupTermine = (groupId: number): GroupTermine => {
  const [span] = useState(() => toTermineWindow(new Date()));
  const calendar = useGroupCalendarQuery(groupId, span);

  const retry = (): void => {
    void calendar.refetch();
  };

  if (calendar.data === undefined) {
    return {
      entries: NO_ENTRIES,
      isLoading: calendar.error === null,
      errorMessage: toHubErrorMessage(calendar.error),
      retry,
    };
  }

  return {
    entries: sortRunningFirst(calendar.data.entries),
    isLoading: false,
    errorMessage: null,
    retry,
  };
};
