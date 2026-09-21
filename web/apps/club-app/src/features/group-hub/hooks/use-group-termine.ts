import { useState } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
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
  canAnswer: boolean;
  retry: () => void;
}

export const useGroupTermine = (groupId: number): GroupTermine => {
  const [span] = useState(() => toTermineWindow(new Date()));
  const { has } = usePermissions();
  const calendar = useGroupCalendarQuery(groupId, span);
  const canAnswer = has(PERMISSION_KEYS.clubRead);

  const retry = (): void => {
    void calendar.refetch();
  };

  if (calendar.data === undefined) {
    return {
      entries: NO_ENTRIES,
      isLoading: calendar.error === null,
      errorMessage: toHubErrorMessage(calendar.error),
      canAnswer,
      retry,
    };
  }

  return {
    entries: sortRunningFirst(calendar.data.entries),
    isLoading: false,
    errorMessage: null,
    canAnswer,
    retry,
  };
};
