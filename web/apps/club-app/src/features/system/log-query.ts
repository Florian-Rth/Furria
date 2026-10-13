import type { LogFilter, LogLevelFilter, LogSourceFilter } from './types';

const LOG_SOURCE_FILTERS: readonly LogSourceFilter[] = ['all', 'api', 'mediaWorker'];
const LOG_LEVEL_FILTERS: readonly LogLevelFilter[] = ['information', 'warning', 'error'];

export const isLogSourceFilter = (value: string): value is LogSourceFilter =>
  LOG_SOURCE_FILTERS.some((known) => known === value);

export const isLogLevelFilter = (value: string): value is LogLevelFilter =>
  LOG_LEVEL_FILTERS.some((known) => known === value);

export const logsPathOf = (filter: LogFilter, before: number | null, take: number): string => {
  const query = new URLSearchParams();

  if (filter.source !== 'all') {
    query.set('source', filter.source);
  }
  query.set('minimumLevel', filter.minimumLevel);
  if (filter.search !== '') {
    query.set('search', filter.search);
  }
  if (before !== null) {
    query.set('before', String(before));
  }
  query.set('take', String(take));

  return `/api/system/logs?${query.toString()}`;
};
