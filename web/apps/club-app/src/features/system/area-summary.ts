import type { SystemStatus } from './schemas';
import { serviceStateOf, workerStateOf } from './system-facts';
import type { SystemArea } from './types';

export type AreaSummary =
  | { kind: 'media'; aliveWorkers: number; running: number; waiting: number }
  | { kind: 'storage'; freeShare: number | null; measuredAgoSeconds: number | null }
  | { kind: 'services'; punctual: number; overdue: number; failed: number }
  | { kind: 'database'; isReachable: boolean; latencyMs: number | null; sizeBytes: number | null }
  | { kind: 'mail'; pending: number; retrying: number }
  | { kind: 'log'; errors: number };

const MILLISECONDS = 1000;

const countWhere = <TItem>(items: readonly TItem[], test: (item: TItem) => boolean): number =>
  items.filter(test).length;

const freeShareOf = (status: SystemStatus): number | null => {
  const { volume } = status.storage;

  return volume === null || volume.totalBytes <= 0 ? null : volume.freeBytes / volume.totalBytes;
};

const measuredAgoOf = (status: SystemStatus, nowMs: number): number | null => {
  const { survey } = status.storage;

  return survey === null
    ? null
    : Math.max(nowMs - new Date(survey.measuredAt).getTime(), 0) / MILLISECONDS;
};

export const areaSummaryOf = (
  area: SystemArea,
  status: SystemStatus,
  nowMs: number,
): AreaSummary => {
  switch (area) {
    case 'media':
      return {
        kind: 'media',
        aliveWorkers: countWhere(
          status.workers,
          (worker) => workerStateOf(worker, nowMs) === 'alive',
        ),
        running: status.queue.running,
        waiting: status.queue.queued + status.queue.retrying,
      };
    case 'storage':
      return {
        kind: 'storage',
        freeShare: freeShareOf(status),
        measuredAgoSeconds: measuredAgoOf(status, nowMs),
      };
    case 'services': {
      const states = status.services.map((service) => serviceStateOf(service, nowMs));

      return {
        kind: 'services',
        punctual: countWhere(states, (state) => state === 'punctual' || state === 'onDemand'),
        overdue: countWhere(states, (state) => state === 'overdue'),
        failed: countWhere(states, (state) => state === 'failed'),
      };
    }
    case 'database':
      return {
        kind: 'database',
        isReachable: status.database.isReachable,
        latencyMs:
          status.database.latencyMs === null ? null : Math.round(status.database.latencyMs),
        sizeBytes: status.database.sizeBytes,
      };
    case 'mail':
      return { kind: 'mail', pending: status.mail.pending, retrying: status.mail.retrying };
    case 'log':
      return {
        kind: 'log',
        errors: status.errorsPerHour.reduce((total, count) => total + count, 0),
      };
  }
};
