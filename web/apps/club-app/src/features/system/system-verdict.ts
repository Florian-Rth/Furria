import type { KkChipTone, KkStatusLevel } from '@furria/ui';
import type { VerdictLevel, VerdictReason } from './schemas';
import type { SystemArea } from './types';

export const REASON_CODES = [
  'databaseUnreachable',
  'pendingMigrations',
  'slowDatabase',
  'workerStale',
  'noLiveWorker',
  'workerVersionMismatch',
  'queueWaiting',
  'diskLow',
  'storageUnmeasured',
  'mediaFailed',
  'errorsLogged',
  'errorBurst',
  'serviceOverdue',
  'serviceFailed',
  'mailRetrying',
  'mailStuck',
] as const;

export type ReasonCode = (typeof REASON_CODES)[number] | 'unknown';

const CHECK_AREAS: Readonly<Record<string, SystemArea>> = {
  database: 'database',
  workers: 'media',
  queue: 'media',
  media: 'media',
  storage: 'storage',
  services: 'services',
  mail: 'mail',
  logs: 'log',
};

const LEVEL_WEIGHT: Record<VerdictLevel, number> = { ok: 0, attention: 1, broken: 2 };

export const reasonCodeOf = (code: string): ReasonCode =>
  REASON_CODES.find((known) => known === code) ?? 'unknown';

export const areaOfCheck = (check: string): SystemArea | null => CHECK_AREAS[check] ?? null;

export const areaLevelOf = (reasons: readonly VerdictReason[], area: SystemArea): VerdictLevel =>
  reasons
    .filter((reason) => areaOfCheck(reason.check) === area)
    .reduce<VerdictLevel>(
      (worst, reason) => (LEVEL_WEIGHT[reason.level] > LEVEL_WEIGHT[worst] ? reason.level : worst),
      'ok',
    );

export const shownLevelOf = (level: VerdictLevel, isConnected: boolean): KkStatusLevel =>
  isConnected ? level : 'unknown';

const CHIP_TONES: Record<KkStatusLevel, KkChipTone> = {
  ok: 'green',
  attention: 'gold',
  broken: 'accent',
  unknown: 'neutral',
};

export const levelChipToneOf = (level: KkStatusLevel): KkChipTone => CHIP_TONES[level];
