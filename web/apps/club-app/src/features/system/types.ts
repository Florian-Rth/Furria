import type { LogSource } from './schemas';

export type LogSourceFilter = 'all' | LogSource;

export type LogLevelFilter = 'information' | 'warning' | 'error';

export interface LogFilter {
  source: LogSourceFilter;
  minimumLevel: LogLevelFilter;
  search: string;
}

export type SystemArea = 'database' | 'media' | 'storage' | 'services' | 'mail' | 'log';
