import type { KkTeleprinterLevel } from '@furria/ui/teleprinter-paint';
import { useState } from 'react';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useSystemLogHeadQuery, useSystemLogsQuery } from '../api';
import type { LogGroup } from '../log-lines';
import { freshCountOf, groupLogEntries, logDayOf, logRowsOf, logTimeOf } from '../log-lines';
import { isLogLevelFilter, isLogSourceFilter } from '../log-query';
import {
  freshLabelOf,
  LOG_SOURCE_CHIPS,
  logDayTextOf,
  logTimeTextOf,
  repeatTextOf,
  toLogErrorMessage,
} from '../system-copy';
import { formatClock, formatDate } from '../system-format';
import type { LogLevelFilter, LogSourceFilter } from '../types';

const SEARCH_SETTLE_MS = 300;

export interface LogLineView {
  key: string;
  level: KkTeleprinterLevel;
  time: string;
  source: string;
  message: string;
  category: string | undefined;
  exception: string | null;
  highlight: boolean;
}

export interface LogGroupView extends LogLineView {
  repeat: string | undefined;
  repeats: LogLineView[];
}

export type LogRowView =
  | { kind: 'day'; key: string; label: string }
  | ({ kind: 'line' } & LogGroupView);

export type LogBodyState = 'loading' | 'failed' | 'empty' | 'shown';

export interface SystemLog {
  source: LogSourceFilter;
  minimumLevel: LogLevelFilter;
  search: string;
  onSource: (id: string) => void;
  onMinimumLevel: (id: string) => void;
  onSearch: (value: string) => void;
  body: LogBodyState;
  failure: string | null;
  isRetrying: boolean;
  onRetry: () => void;
  rows: LogRowView[];
  fresh: string | null;
  onReveal: () => void;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  olderFailed: boolean;
  onLoadOlder: () => void;
}

const lineViewOf = (
  entry: LogGroup['head'],
  now: Date,
  revealedAfter: number | null,
): LogLineView => ({
  key: `log-${entry.id}`,
  level: entry.level,
  time: logTimeTextOf(logTimeOf(new Date(entry.loggedAt), now)),
  source: LOG_SOURCE_CHIPS[entry.source],
  message: entry.message,
  category: entry.category ?? undefined,
  exception: entry.exception,
  highlight: revealedAfter !== null && entry.id > revealedAfter,
});

const groupViewOf = (group: LogGroup, now: Date, revealedAfter: number | null): LogGroupView => {
  const oldest = group.entries.at(-1) ?? group.head;
  const repeat =
    group.entries.length > 1
      ? repeatTextOf(
          group.entries.length,
          formatClock(new Date(oldest.loggedAt)),
          formatClock(new Date(group.head.loggedAt)),
        )
      : undefined;

  return {
    ...lineViewOf(group.head, now, revealedAfter),
    repeat,
    repeats: group.entries.slice(1).map((entry) => lineViewOf(entry, now, revealedAfter)),
  };
};

const bodyStateOf = (isMissing: boolean, isError: boolean, count: number): LogBodyState => {
  if (isMissing) {
    return isError ? 'failed' : 'loading';
  }

  return count === 0 ? 'empty' : 'shown';
};

export const useSystemLog = (nowMs: number): SystemLog => {
  const [source, setSource] = useState<LogSourceFilter>('all');
  const [minimumLevel, setMinimumLevel] = useState<LogLevelFilter>('warning');
  const [search, setSearch] = useState('');
  const [revealedAfter, setRevealedAfter] = useState<number | null>(null);
  const settledSearch = useDebouncedValue(search.trim(), SEARCH_SETTLE_MS);
  const filter = { source, minimumLevel, search: settledSearch };
  const logs = useSystemLogsQuery(filter);
  const head = useSystemLogHeadQuery(filter);
  const now = new Date(nowMs);
  const entries = logs.data?.pages.flatMap((page) => page.entries) ?? [];
  const newestShownId = entries[0]?.id ?? null;
  const freshCount =
    logs.data === undefined ? 0 : freshCountOf(head.data?.entries ?? [], newestShownId);
  const rows = logRowsOf(groupLogEntries(entries)).map((row): LogRowView => {
    if (row.kind === 'day') {
      const date = formatDate(new Date(`${row.day}T00:00:00`));

      return { kind: 'day', key: row.key, label: logDayTextOf(logDayOf(row.day, now), date) };
    }

    return { kind: 'line', ...groupViewOf(row.group, now, revealedAfter) };
  });

  const onSource = (id: string): void => {
    if (isLogSourceFilter(id)) {
      setSource(id);
    }
  };

  const onMinimumLevel = (id: string): void => {
    if (isLogLevelFilter(id)) {
      setMinimumLevel(id);
    }
  };

  const onReveal = (): void => {
    setRevealedAfter(newestShownId);
    void logs.refetch();
    void head.refetch();
  };

  const onLoadOlder = (): void => {
    void logs.fetchNextPage();
  };

  const onRetry = (): void => {
    void logs.refetch();
  };

  const body = bodyStateOf(logs.data === undefined, logs.isError, entries.length);

  return {
    source,
    minimumLevel,
    search,
    onSource,
    onMinimumLevel,
    onSearch: setSearch,
    body,
    failure: body === 'failed' ? toLogErrorMessage(logs.error) : null,
    isRetrying: logs.isFetching,
    onRetry,
    rows,
    fresh: freshCount > 0 ? freshLabelOf(freshCount) : null,
    onReveal,
    hasOlder: logs.hasNextPage,
    isLoadingOlder: logs.isFetchingNextPage,
    olderFailed: logs.isFetchNextPageError,
    onLoadOlder,
  };
};
