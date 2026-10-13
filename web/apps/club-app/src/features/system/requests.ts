import { apiFetch } from '@/lib/api/api-fetch';
import { logsPathOf } from './log-query';
import type { LogPage, SystemStatus } from './schemas';
import { LogPageSchema, SystemStatusSchema } from './schemas';
import type { LogFilter } from './types';

export const requestSystemStatus = (accessToken: string): Promise<SystemStatus> =>
  apiFetch('/api/system/status', { schema: SystemStatusSchema, accessToken });

export const requestSystemLogs = (
  filter: LogFilter,
  before: number | null,
  take: number,
  accessToken: string,
): Promise<LogPage> =>
  apiFetch(logsPathOf(filter, before, take), { schema: LogPageSchema, accessToken });
