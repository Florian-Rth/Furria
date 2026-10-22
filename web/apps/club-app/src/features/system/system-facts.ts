import type { KkHeartbeatState } from '@furria/ui/KkHeartbeat';
import type {
  BackgroundService,
  MediaFacts,
  MediaKind,
  MediaState,
  MediaWorker,
  SystemStatus,
  VerdictLevel,
} from './schemas';
import { areaLevelOf } from './system-verdict';
import type { SystemArea } from './types';

export type ServiceState = 'onDemand' | 'punctual' | 'overdue' | 'failed';

export type BoardFigure =
  | { kind: 'latency'; ms: number }
  | { kind: 'unreachable' }
  | { kind: 'free'; share: number }
  | { kind: 'unmeasured' }
  | { kind: 'count'; count: number };

export interface BoardRow {
  area: SystemArea;
  level: VerdictLevel;
  figure: BoardFigure;
}

export type MediaTally = Record<MediaKind, Record<MediaState, number>>;

const DUE_GRACE_MS = 60_000;
const STALE_WORKER_MS = 5 * 60_000;
const BOARD_AREAS: readonly SystemArea[] = [
  'database',
  'media',
  'storage',
  'services',
  'mail',
  'log',
];

const millisOf = (moment: string | null): number | null =>
  moment === null ? null : new Date(moment).getTime();

export const serviceStateOf = (service: BackgroundService, nowMs: number): ServiceState => {
  const dueMs = millisOf(service.nextDueAt);

  if (service.lastFailure !== null || service.consecutiveFailures > 0) {
    return 'failed';
  }
  if (service.cadenceSeconds === null || dueMs === null) {
    return 'onDemand';
  }

  return nowMs > dueMs + DUE_GRACE_MS ? 'overdue' : 'punctual';
};

export const needsLook = (state: ServiceState): boolean =>
  state === 'overdue' || state === 'failed';

export const workerStateOf = (worker: MediaWorker, nowMs: number): KkHeartbeatState => {
  if (worker.isAlive) {
    return 'alive';
  }

  return nowMs - new Date(worker.lastSeenAt).getTime() <= STALE_WORKER_MS ? 'stale' : 'gone';
};

export const mediaTallyOf = (counts: MediaFacts['counts']): MediaTally => {
  const tally: MediaTally = {
    photo: { ready: 0, processing: 0, failed: 0 },
    video: { ready: 0, processing: 0, failed: 0 },
  };

  for (const entry of counts) {
    tally[entry.kind][entry.state] += entry.count;
  }

  return tally;
};

const sumOf = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const figureOf = (area: SystemArea, status: SystemStatus, nowMs: number): BoardFigure => {
  switch (area) {
    case 'database':
      return status.database.isReachable
        ? { kind: 'latency', ms: Math.round(status.database.latencyMs ?? 0) }
        : { kind: 'unreachable' };
    case 'media':
      return {
        kind: 'count',
        count: status.queue.queued + status.queue.running + status.queue.retrying,
      };
    case 'storage':
      return status.storage.volume === null || status.storage.volume.totalBytes <= 0
        ? { kind: 'unmeasured' }
        : {
            kind: 'free',
            share: status.storage.volume.freeBytes / status.storage.volume.totalBytes,
          };
    case 'services':
      return {
        kind: 'count',
        count: status.services.filter((service) => needsLook(serviceStateOf(service, nowMs)))
          .length,
      };
    case 'mail':
      return { kind: 'count', count: status.mail.pending };
    case 'log':
      return { kind: 'count', count: sumOf(status.errorsPerHour) };
  }
};

export const boardRowsOf = (status: SystemStatus, nowMs: number): BoardRow[] =>
  BOARD_AREAS.map((area) => ({
    area,
    level: areaLevelOf(status.verdict.reasons, area),
    figure: figureOf(area, status, nowMs),
  }));

export const serverNowOf = (checkedAt: string, fetchedAtMs: number, nowMs: number): Date =>
  new Date(new Date(checkedAt).getTime() + Math.max(nowMs - fetchedAtMs, 0));
