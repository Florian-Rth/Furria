import { z } from 'zod';

const MomentSchema = z.iso.datetime({ offset: true });

export const VERDICT_LEVELS = ['ok', 'attention', 'broken'] as const;
export const VerdictLevelSchema = z.enum(VERDICT_LEVELS);
export type VerdictLevel = z.infer<typeof VerdictLevelSchema>;

export const VerdictReasonSchema = z.object({
  check: z.string(),
  level: VerdictLevelSchema,
  code: z.string(),
  value: z.number().nullable(),
  subject: z.string().nullable(),
});
export type VerdictReason = z.infer<typeof VerdictReasonSchema>;

const ByteCountSchema = z.object({ bytes: z.number(), files: z.number() });
export type ByteCount = z.infer<typeof ByteCountSchema>;

export const DatabaseTableSchema = z.object({
  name: z.string(),
  sizeBytes: z.number(),
  rowEstimate: z.number(),
});
export type DatabaseTable = z.infer<typeof DatabaseTableSchema>;

export const DatabaseFactsSchema = z.object({
  isReachable: z.boolean(),
  latencyMs: z.number().nullable(),
  version: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  connections: z.number().nullable(),
  maxConnections: z.number().nullable(),
  lastMigration: z.string().nullable(),
  pendingMigrations: z.number().nullable(),
  tables: z.array(DatabaseTableSchema),
});
export type DatabaseFacts = z.infer<typeof DatabaseFactsSchema>;

export const StorageSurveySchema = z.object({
  measuredAt: MomentSchema,
  cadenceSeconds: z.number(),
  originals: ByteCountSchema,
  renditions: ByteCountSchema,
  staging: ByteCountSchema,
});
export type StorageSurvey = z.infer<typeof StorageSurveySchema>;

export const StorageFactsSchema = z.object({
  volume: z.object({ freeBytes: z.number(), totalBytes: z.number() }).nullable(),
  survey: StorageSurveySchema.nullable(),
});
export type StorageFacts = z.infer<typeof StorageFactsSchema>;

export const MEDIA_KINDS = ['photo', 'video'] as const;
export const MediaKindSchema = z.enum(MEDIA_KINDS);
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const MEDIA_STATES = ['ready', 'processing', 'failed'] as const;
export const MediaStateSchema = z.enum(MEDIA_STATES);
export type MediaState = z.infer<typeof MediaStateSchema>;

export const FailedMediaItemSchema = z.object({
  mediaItemId: z.number(),
  ownerKind: z.string(),
  fileName: z.string(),
  reason: z.string().nullable(),
  failedAt: MomentSchema,
});
export type FailedMediaItem = z.infer<typeof FailedMediaItemSchema>;

export const MediaFactsSchema = z.object({
  counts: z.array(z.object({ kind: MediaKindSchema, state: MediaStateSchema, count: z.number() })),
  totalBytes: z.number(),
  failed: z.array(FailedMediaItemSchema),
});
export type MediaFacts = z.infer<typeof MediaFactsSchema>;

export const QueueFactsSchema = z.object({
  queued: z.number(),
  running: z.number(),
  retrying: z.number(),
  oldestQueuedAt: MomentSchema.nullable(),
});
export type QueueFacts = z.infer<typeof QueueFactsSchema>;

export const MediaWorkerSchema = z.object({
  instanceId: z.string(),
  hostName: z.string(),
  version: z.string(),
  hardwareAcceleration: z.string().nullable(),
  startedAt: MomentSchema,
  lastSeenAt: MomentSchema,
  isAlive: z.boolean(),
  photoMediaItemId: z.number().nullable(),
  videoMediaItemId: z.number().nullable(),
});
export type MediaWorker = z.infer<typeof MediaWorkerSchema>;

export const BackgroundServiceSchema = z.object({
  job: z.string(),
  cadenceSeconds: z.number().nullable(),
  lastRunAt: MomentSchema.nullable(),
  lastFailure: z.string().nullable(),
  consecutiveFailures: z.number(),
  nextDueAt: MomentSchema.nullable(),
});
export type BackgroundService = z.infer<typeof BackgroundServiceSchema>;

export const MailFactsSchema = z.object({
  pending: z.number(),
  retrying: z.number(),
  oldestPendingAt: MomentSchema.nullable(),
});
export type MailFacts = z.infer<typeof MailFactsSchema>;

export const SystemStatusSchema = z.object({
  checkedAt: MomentSchema,
  verdict: z.object({ level: VerdictLevelSchema, reasons: z.array(VerdictReasonSchema) }),
  app: z.object({ version: z.string(), environment: z.string(), startedAt: MomentSchema }),
  database: DatabaseFactsSchema,
  storage: StorageFactsSchema,
  media: MediaFactsSchema,
  queue: QueueFactsSchema,
  workers: z.array(MediaWorkerSchema),
  services: z.array(BackgroundServiceSchema),
  mail: MailFactsSchema,
  errorsPerHour: z.array(z.number()),
  logsSince: MomentSchema.nullable(),
});
export type SystemStatus = z.infer<typeof SystemStatusSchema>;

export const LOG_SOURCES = ['api', 'mediaWorker'] as const;
export const LogSourceSchema = z.enum(LOG_SOURCES);
export type LogSource = z.infer<typeof LogSourceSchema>;

export const LOG_LEVELS = ['information', 'warning', 'error', 'fatal'] as const;
export const LogLevelSchema = z.enum(LOG_LEVELS);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogEntrySchema = z.object({
  id: z.number(),
  loggedAt: MomentSchema,
  source: LogSourceSchema,
  instance: z.string().nullable(),
  level: LogLevelSchema,
  category: z.string().nullable(),
  template: z.string(),
  message: z.string(),
  exception: z.string().nullable(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

export const LogPageSchema = z.object({
  entries: z.array(LogEntrySchema),
  nextBefore: z.number().nullable(),
});
export type LogPage = z.infer<typeof LogPageSchema>;
