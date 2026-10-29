import { describe, expect, it } from 'vitest';
import type { BackgroundService, MediaWorker, SystemStatus } from './schemas';
import type { BoardFigure, ServiceState } from './system-facts';
import {
  boardRowsOf,
  mediaTallyOf,
  serverNowOf,
  serviceStateOf,
  workerStateOf,
} from './system-facts';

const NOW = Date.UTC(2026, 9, 13, 12, 0, 0);

const service = (overrides: Partial<BackgroundService>): BackgroundService => ({
  job: 'mailDispatcher',
  cadenceSeconds: 60,
  lastRunAt: '2026-10-13T11:59:00Z',
  lastFailure: null,
  consecutiveFailures: 0,
  nextDueAt: '2026-10-13T12:00:00Z',
  ...overrides,
});

describe('serviceStateOf', () => {
  it.each<{ label: string; overrides: Partial<BackgroundService>; state: ServiceState }>([
    { label: 'is punctual while due now', overrides: {}, state: 'punctual' },
    {
      label: 'is overdue a minute past due',
      overrides: { nextDueAt: '2026-10-13T11:58:30Z' },
      state: 'overdue',
    },
    {
      label: 'runs on request without a cadence',
      overrides: { cadenceSeconds: null, nextDueAt: null },
      state: 'onDemand',
    },
    {
      label: 'reports a failed last run before anything else',
      overrides: { lastFailure: 'timeout', consecutiveFailures: 1, nextDueAt: null },
      state: 'failed',
    },
  ])('$label', ({ overrides, state }) => {
    expect(serviceStateOf(service(overrides), NOW)).toBe(state);
  });
});

describe('workerStateOf', () => {
  const worker = (isAlive: boolean, lastSeenAt: string): MediaWorker => ({
    instanceId: '6b1f',
    hostName: 'media-1',
    version: '0.9.0',
    hardwareAcceleration: null,
    startedAt: '2026-10-13T08:00:00Z',
    lastSeenAt,
    isAlive,
    photoMediaItemId: null,
    videoMediaItemId: null,
    audioMediaItemId: null,
  });

  it.each<{ label: string; worker: MediaWorker; state: string }>([
    { label: 'beats while alive', worker: worker(true, '2026-10-13T11:59:50Z'), state: 'alive' },
    {
      label: 'goes quiet for minutes',
      worker: worker(false, '2026-10-13T11:57:00Z'),
      state: 'stale',
    },
    {
      label: 'is gone after five minutes',
      worker: worker(false, '2026-10-13T11:50:00Z'),
      state: 'gone',
    },
  ])('$label', ({ worker: subject, state }) => {
    expect(workerStateOf(subject, NOW)).toBe(state);
  });
});

describe('mediaTallyOf', () => {
  it('adds the counts per kind and state and fills the gaps with zero', () => {
    expect(
      mediaTallyOf([
        { kind: 'photo', state: 'ready', count: 120 },
        { kind: 'photo', state: 'failed', count: 2 },
        { kind: 'video', state: 'processing', count: 1 },
      ]),
    ).toEqual({
      photo: { ready: 120, processing: 0, failed: 2 },
      video: { ready: 0, processing: 1, failed: 0 },
      audio: { ready: 0, processing: 0, failed: 0 },
    });
  });
});

describe('boardRowsOf', () => {
  const status: SystemStatus = {
    checkedAt: '2026-10-13T12:00:00Z',
    verdict: {
      level: 'attention',
      reasons: [
        { check: 'storage', level: 'attention', code: 'diskLow', value: 12, subject: null },
      ],
    },
    app: { version: '0.9.0', environment: 'Production', startedAt: '2026-10-13T08:00:00Z' },
    database: {
      isReachable: true,
      latencyMs: 3.6,
      version: '17.2',
      sizeBytes: 1000,
      connections: 4,
      maxConnections: 100,
      lastMigration: 'SystemStatus',
      pendingMigrations: 0,
      tables: [],
    },
    storage: { volume: { freeBytes: 12, totalBytes: 100 }, survey: null },
    media: { counts: [], totalBytes: 0, failed: [] },
    queue: { queued: 3, running: 1, retrying: 1, oldestQueuedAt: null },
    workers: [],
    services: [
      service({}),
      service({ job: 'galleryBinPurge', nextDueAt: '2026-10-13T10:00:00Z' }),
      service({ job: 'logEntryPurge', lastFailure: 'boom', consecutiveFailures: 2 }),
    ],
    mail: { pending: 4, retrying: 0, oldestPendingAt: null },
    errorsPerHour: [0, 2, 0, 5],
    logsSince: null,
  };

  it('reads one figure and the worst level per area', () => {
    expect(boardRowsOf(status, NOW).map((row) => [row.area, row.level, row.figure])).toEqual<
      [string, string, BoardFigure][]
    >([
      ['database', 'ok', { kind: 'latency', ms: 4 }],
      ['media', 'ok', { kind: 'count', count: 5 }],
      ['storage', 'attention', { kind: 'free', share: 0.12 }],
      ['services', 'ok', { kind: 'count', count: 2 }],
      ['mail', 'ok', { kind: 'count', count: 4 }],
      ['log', 'ok', { kind: 'count', count: 7 }],
    ]);
  });
});

describe('serverNowOf', () => {
  it('runs the server clock on from the moment it was read', () => {
    expect(serverNowOf('2026-10-13T12:00:00Z', 1_000, 4_500).toISOString()).toBe(
      '2026-10-13T12:00:03.500Z',
    );
  });
});
