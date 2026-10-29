import { describe, expect, it } from 'vitest';
import type { AreaSummary } from './area-summary';
import { areaSummaryOf } from './area-summary';
import type { SystemStatus } from './schemas';
import type { SystemArea } from './types';

const NOW = Date.UTC(2026, 9, 13, 12, 0, 0);

const status: SystemStatus = {
  checkedAt: '2026-10-13T12:00:00Z',
  verdict: { level: 'ok', reasons: [] },
  app: { version: '0.9.0', environment: 'Production', startedAt: '2026-10-13T08:00:00Z' },
  database: {
    isReachable: true,
    latencyMs: 3.6,
    version: '17.2',
    sizeBytes: 190_840_832,
    connections: 4,
    maxConnections: 100,
    lastMigration: 'SystemStatus',
    pendingMigrations: 0,
    tables: [],
  },
  storage: {
    volume: { freeBytes: 38, totalBytes: 100 },
    survey: {
      measuredAt: '2026-10-13T10:00:00Z',
      cadenceSeconds: 21_600,
      originals: { bytes: 40, files: 4 },
      renditions: { bytes: 10, files: 12 },
      staging: { bytes: 0, files: 0 },
    },
  },
  media: { counts: [], totalBytes: 50, failed: [] },
  queue: { queued: 2, running: 1, retrying: 1, oldestQueuedAt: '2026-10-13T11:58:00Z' },
  workers: [
    {
      instanceId: 'a',
      hostName: 'media-1',
      version: '0.9.0',
      hardwareAcceleration: 'vaapi',
      startedAt: '2026-10-13T08:00:00Z',
      lastSeenAt: '2026-10-13T11:59:55Z',
      isAlive: true,
      photoMediaItemId: 12,
      videoMediaItemId: null,
      audioMediaItemId: null,
    },
    {
      instanceId: 'b',
      hostName: 'media-2',
      version: '0.9.0',
      hardwareAcceleration: null,
      startedAt: '2026-10-13T08:00:00Z',
      lastSeenAt: '2026-10-13T11:58:00Z',
      isAlive: false,
      photoMediaItemId: null,
      videoMediaItemId: null,
      audioMediaItemId: null,
    },
  ],
  services: [
    {
      job: 'mailDispatcher',
      cadenceSeconds: 60,
      lastRunAt: '2026-10-13T11:59:30Z',
      lastFailure: null,
      consecutiveFailures: 0,
      nextDueAt: '2026-10-13T12:00:30Z',
    },
    {
      job: 'galleryBinPurge',
      cadenceSeconds: 3600,
      lastRunAt: '2026-10-13T09:00:00Z',
      lastFailure: null,
      consecutiveFailures: 0,
      nextDueAt: '2026-10-13T10:00:00Z',
    },
    {
      job: 'logEntryPurge',
      cadenceSeconds: 3600,
      lastRunAt: '2026-10-13T11:30:00Z',
      lastFailure: 'timeout',
      consecutiveFailures: 1,
      nextDueAt: '2026-10-13T12:30:00Z',
    },
    {
      job: 'mediaStorageSurvey',
      cadenceSeconds: null,
      lastRunAt: null,
      lastFailure: null,
      consecutiveFailures: 0,
      nextDueAt: null,
    },
  ],
  mail: { pending: 3, retrying: 1, oldestPendingAt: '2026-10-13T11:59:00Z' },
  errorsPerHour: [1, 0, 2],
  logsSince: '2026-10-10T12:00:00Z',
};

describe('areaSummaryOf', () => {
  it.each<{ area: SystemArea; summary: AreaSummary }>([
    { area: 'media', summary: { kind: 'media', aliveWorkers: 1, running: 1, waiting: 3 } },
    {
      area: 'storage',
      summary: { kind: 'storage', freeShare: 0.38, measuredAgoSeconds: 7200 },
    },
    { area: 'services', summary: { kind: 'services', punctual: 2, overdue: 1, failed: 1 } },
    {
      area: 'database',
      summary: { kind: 'database', isReachable: true, latencyMs: 4, sizeBytes: 190_840_832 },
    },
    { area: 'mail', summary: { kind: 'mail', pending: 3, retrying: 1 } },
    { area: 'log', summary: { kind: 'log', errors: 3 } },
  ])('sums up $area', ({ area, summary }) => {
    expect(areaSummaryOf(area, status, NOW)).toEqual(summary);
  });

  it('knows neither free space nor survey age when nothing was measured', () => {
    expect(
      areaSummaryOf('storage', { ...status, storage: { volume: null, survey: null } }, NOW),
    ).toEqual({ kind: 'storage', freeShare: null, measuredAgoSeconds: null });
  });
});
