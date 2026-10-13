import { isForbiddenError } from '@/lib/query-error';
import { useNow } from '@/lib/use-now';
import { useSystemStatusQuery } from '../api';
import type { SystemStatus } from '../schemas';
import { offlineSinceOf } from '../system-copy';
import { formatClock } from '../system-format';
import type { SystemMoment } from '../system-view';

const TICK_MS = 1000;

export type SystemStatusRead =
  | { kind: 'loading'; nowMs: number }
  | { kind: 'denied'; nowMs: number }
  | { kind: 'failed'; nowMs: number; retry: () => void }
  | {
      kind: 'shown';
      nowMs: number;
      status: SystemStatus;
      moment: SystemMoment;
      offline: string | null;
    };

export const useSystemStatus = (): SystemStatusRead => {
  const query = useSystemStatusQuery();
  const nowMs = useNow(TICK_MS).getTime();

  const retry = (): void => {
    void query.refetch();
  };

  if (query.data === undefined) {
    if (isForbiddenError(query.error)) {
      return { kind: 'denied', nowMs };
    }

    return query.isError ? { kind: 'failed', nowMs, retry } : { kind: 'loading', nowMs };
  }

  const isConnected = !query.isError;
  const offline = isConnected
    ? null
    : offlineSinceOf(formatClock(new Date(query.dataUpdatedAt)));

  return {
    kind: 'shown',
    nowMs,
    status: query.data,
    moment: { nowMs, fetchedAtMs: query.dataUpdatedAt, isConnected },
    offline,
  };
};
