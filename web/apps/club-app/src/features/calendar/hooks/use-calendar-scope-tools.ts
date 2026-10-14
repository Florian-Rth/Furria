import type { KkFilterOption } from '@furria/ui';
import { useState } from 'react';
import { useCalendarQuery } from '../api';
import { toScopeOptions, toUnloadedScopeOptions } from '../calendar-labels';
import { ALL_SCOPE_ID } from '../calendar-query';
import type { CalendarResponse } from '../schemas';
import type { CalendarBoard } from './use-calendar-board';

export type CalendarScopeToolsPhase = 'loading' | 'ready' | 'failed';

export interface CalendarScopeTools {
  phase: CalendarScopeToolsPhase;
  options: readonly KkFilterOption[];
  showsError: boolean;
  isRetrying: boolean;
  retry: () => void;
}

export const useCalendarScopeTools = (board: CalendarBoard): CalendarScopeTools => {
  const scopeSource = useCalendarQuery(board.scopeSourceQuery);
  const [seenData, setSeenData] = useState<CalendarResponse | undefined>(undefined);
  const [knownOptions, setKnownOptions] = useState<readonly KkFilterOption[] | null>(null);

  if (scopeSource.data !== undefined && scopeSource.data !== seenData) {
    setSeenData(scopeSource.data);
    setKnownOptions(toScopeOptions(scopeSource.data.entries));
  }

  const retry = (): void => {
    void scopeSource.refetch();
  };

  const tools = { isRetrying: scopeSource.isFetching, retry };

  if (scopeSource.data !== undefined) {
    return {
      ...tools,
      phase: 'ready',
      options: toScopeOptions(scopeSource.data.entries),
      showsError: false,
    };
  }
  if (scopeSource.isError) {
    return {
      ...tools,
      phase: 'failed',
      options: toUnloadedScopeOptions(board.scopeId, knownOptions),
      showsError: board.scopeId !== ALL_SCOPE_ID,
    };
  }

  return { ...tools, phase: 'loading', options: [], showsError: false };
};
