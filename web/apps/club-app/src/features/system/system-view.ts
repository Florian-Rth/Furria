import type {
  KkChipTone,
  KkFillGaugePart,
  KkFillGaugeRest,
  KkFlapBoardFact,
  KkFlapBoardReason,
  KkFlapGridColumn,
  KkFlapGridRow,
  KkHeartbeatState,
  KkIconName,
  KkRankBar,
  KkStatusLevel,
} from '@furria/ui';
import { areaSummaryOf } from './area-summary';
import type { SystemStatus } from './schemas';
import { MEDIA_KINDS, MEDIA_STATES } from './schemas';
import type { ReasonContext } from './system-copy';
import {
  AREA_CALM,
  AREA_ICONS,
  AREA_LABELS,
  AREA_ORDER,
  areaPathOf,
  areaSummaryTextOf,
  DATABASE_FACT_LABELS,
  figureTextOf,
  filesOf,
  HEARTBEAT_WORDS,
  LEVEL_WORDS,
  MEDIA_KIND_LABELS,
  MEDIA_STATE_LABELS,
  measuredAgoOf,
  NO,
  oldestWaitingOf,
  PROGRAM_FACT_LABELS,
  ROW_WORDS,
  reasonTextOf,
  rowsAboutOf,
  SECTION_TITLES,
  STORAGE_PART_LABELS,
  serviceNameOf,
  UNKNOWN_VALUE,
  VERDICT_WORDS,
  workerMetaOf,
  workerNameOf,
  YES,
} from './system-copy';
import type { ServiceState } from './system-facts';
import {
  boardRowsOf,
  mediaTallyOf,
  needsLook,
  serverNowOf,
  serviceStateOf,
  workerStateOf,
} from './system-facts';
import {
  formatBytes,
  formatClock,
  formatClockSeconds,
  formatCount,
  formatDate,
  formatShortDate,
  formatSpan,
  formatVersion,
} from './system-format';
import { areaLevelOf, areaOfCheck, levelChipToneOf, shownLevelOf } from './system-verdict';
import type { SystemArea } from './types';

const reasonContextOf = (status: SystemStatus): ReasonContext => ({
  appVersion: status.app.version,
  workers: status.workers,
});

export interface SystemMoment {
  nowMs: number;
  fetchedAtMs: number;
  isConnected: boolean;
}

export interface BoardRowView {
  key: string;
  level: KkStatusLevel;
  label: string;
  figure: string;
  word: string;
  to: string;
  accessibleLabel: string;
}

export interface BoardView {
  facts: KkFlapBoardFact[];
  rows: BoardRowView[];
  verdictLevel: KkStatusLevel;
  verdictWord: string;
  reasons: KkFlapBoardReason[];
}

const sinceOf = (moment: string): string => {
  const at = new Date(moment);

  return `${formatShortDate(at)} ${formatClock(at)}`;
};

export const programFactsOf = (status: SystemStatus, moment: SystemMoment): KkFlapBoardFact[] => {
  const serverNow = serverNowOf(status.checkedAt, moment.fetchedAtMs, moment.nowMs);

  return [
    {
      key: 'version',
      label: PROGRAM_FACT_LABELS.version,
      value: formatVersion(status.app.version),
    },
    { key: 'environment', label: PROGRAM_FACT_LABELS.environment, value: status.app.environment },
    {
      key: 'since',
      label: PROGRAM_FACT_LABELS.runningSince,
      value: sinceOf(status.app.startedAt),
    },
    { key: 'time', label: PROGRAM_FACT_LABELS.serverTime, value: formatClockSeconds(serverNow) },
  ];
};

export const boardViewOf = (status: SystemStatus, moment: SystemMoment): BoardView => {
  const rows = boardRowsOf(status, moment.nowMs).map((row) => {
    const level = shownLevelOf(row.level, moment.isConnected);
    const figure = figureTextOf(row.area, row.figure);
    const word = ROW_WORDS[level];

    return {
      key: row.area,
      level,
      label: AREA_LABELS[row.area],
      figure,
      word,
      to: areaPathOf(row.area),
      accessibleLabel: `${AREA_LABELS[row.area]}: ${figure}, ${word}`,
    };
  });
  const verdictLevel = shownLevelOf(status.verdict.level, moment.isConnected);
  const reasons = status.verdict.reasons.map((reason, order) => {
    const area = areaOfCheck(reason.check);

    return {
      key: `${reason.check}-${reason.code}-${order}`,
      level: shownLevelOf(reason.level, moment.isConnected),
      text: reasonTextOf(reason, reasonContextOf(status)),
      to: areaPathOf(area),
    };
  });

  return {
    facts: programFactsOf(status, moment),
    rows,
    verdictLevel,
    verdictWord: VERDICT_WORDS[verdictLevel],
    reasons,
  };
};

export interface HeartbeatView {
  key: string;
  state: KkHeartbeatState;
  beatKey: string;
  title: string;
  word: string;
  meta: string[];
}

export interface FailedLineView {
  key: string;
  title: string;
  meta: string;
  reason: string | undefined;
  trailing: string;
}

export interface MediaView {
  queue: { running: number; retrying: number; queued: number; aside: string };
  workers: HeartbeatView[];
  columns: KkFlapGridColumn[];
  rows: KkFlapGridRow[];
  failed: FailedLineView[];
  totalBytes: string;
}

export const mediaViewOf = (status: SystemStatus, nowMs: number): MediaView => {
  const tally = mediaTallyOf(status.media.counts);
  const oldest = status.queue.oldestQueuedAt;
  const waited = oldest === null ? null : (nowMs - new Date(oldest).getTime()) / 1000;

  return {
    queue: {
      running: status.queue.running,
      retrying: status.queue.retrying,
      queued: status.queue.queued,
      aside: oldestWaitingOf(waited),
    },
    workers: status.workers.map((worker, position) => {
      const state = workerStateOf(worker, nowMs);

      return {
        key: worker.instanceId,
        state,
        beatKey: worker.lastSeenAt,
        title: workerNameOf(position, status.workers.length),
        word: HEARTBEAT_WORDS[state],
        meta: workerMetaOf(
          worker.hostName,
          formatVersion(worker.version),
          worker.hardwareAcceleration,
          worker.photoMediaItemId,
          worker.videoMediaItemId,
        ),
      };
    }),
    columns: MEDIA_STATES.map((state) => ({ key: state, label: MEDIA_STATE_LABELS[state] })),
    rows: MEDIA_KINDS.map((kind) => ({
      key: kind,
      label: MEDIA_KIND_LABELS[kind],
      cells: MEDIA_STATES.map((state) => {
        const count = tally[kind][state];

        return {
          key: `${kind}-${state}`,
          value: formatCount(count),
          tone: state === 'failed' && count > 0 ? ('red' as const) : ('ink' as const),
        };
      }),
    })),
    failed: status.media.failed.map((item) => {
      const failedAt = new Date(item.failedAt);

      return {
        key: String(item.mediaItemId),
        title: item.fileName,
        meta: `#${item.mediaItemId} · ${item.ownerKind}`,
        reason: item.reason === null || item.reason === '' ? undefined : item.reason,
        trailing: `${formatDate(failedAt)} ${formatClock(failedAt)}`,
      };
    }),
    totalBytes: formatBytes(status.media.totalBytes),
  };
};

export interface StorageView {
  parts: KkFillGaugePart[];
  other: KkFillGaugeRest | null;
  free: KkFillGaugeRest | null;
  totalBytes: number | null;
  measured: string | undefined;
}

export const storageViewOf = (status: SystemStatus, nowMs: number): StorageView => {
  const { volume, survey } = status.storage;
  const parts =
    survey === null
      ? []
      : (['originals', 'renditions', 'staging'] as const).map((part) => ({
          key: part,
          label: STORAGE_PART_LABELS[part],
          figure: filesOf(survey[part].bytes, survey[part].files),
          bytes: survey[part].bytes,
        }));
  const surveyed = parts.reduce((total, part) => total + part.bytes, 0);
  const otherBytes =
    volume === null ? 0 : Math.max(volume.totalBytes - volume.freeBytes - surveyed, 0);

  return {
    parts,
    other:
      volume === null
        ? null
        : { label: STORAGE_PART_LABELS.other, figure: formatBytes(otherBytes), bytes: otherBytes },
    free:
      volume === null
        ? null
        : {
            label: STORAGE_PART_LABELS.free,
            figure: formatBytes(volume.freeBytes),
            bytes: volume.freeBytes,
          },
    totalBytes: volume?.totalBytes ?? null,
    measured:
      survey === null
        ? undefined
        : measuredAgoOf((nowMs - new Date(survey.measuredAt).getTime()) / 1000),
  };
};

export interface ServiceRowView {
  key: string;
  label: string;
  meta: string;
  state: ServiceState;
  lastRunMs: number | null;
  dueMs: number | null;
  cadenceMs: number | null;
  failure: string | undefined;
}

export interface ServicesView {
  attention: ServiceRowView[];
  punctual: ServiceRowView[];
}

const millisOrNull = (moment: string | null): number | null =>
  moment === null ? null : new Date(moment).getTime();

const serviceMetaOf = (lastRunMs: number | null, dueMs: number | null, nowMs: number): string => {
  const last =
    lastRunMs === null
      ? 'noch nie gelaufen'
      : `zuletzt vor ${formatSpan((nowMs - lastRunMs) / 1000)}`;

  if (dueMs === null) {
    return last;
  }

  const next =
    dueMs >= nowMs
      ? `fällig in ${formatSpan((dueMs - nowMs) / 1000)}`
      : `fällig seit ${formatSpan((nowMs - dueMs) / 1000)}`;

  return `${last} · ${next}`;
};

export const servicesViewOf = (status: SystemStatus, nowMs: number): ServicesView => {
  const rows = status.services.map((service) => {
    const lastRunMs = millisOrNull(service.lastRunAt);
    const dueMs = millisOrNull(service.nextDueAt);

    return {
      key: service.job,
      label: serviceNameOf(service.job),
      meta: serviceMetaOf(lastRunMs, dueMs, nowMs),
      state: serviceStateOf(service, nowMs),
      lastRunMs,
      dueMs,
      cadenceMs: service.cadenceSeconds === null ? null : service.cadenceSeconds * 1000,
      failure: service.lastFailure ?? undefined,
    };
  });

  return {
    attention: rows.filter((row) => needsLook(row.state)),
    punctual: rows.filter((row) => !needsLook(row.state)),
  };
};

export interface DatabaseFactView {
  key: string;
  label: string;
  value: string;
  level?: KkStatusLevel;
}

export interface DatabaseView {
  facts: DatabaseFactView[];
  tables: KkRankBar[];
}

const pendingLevelOf = (pending: number | null): KkStatusLevel | undefined => {
  if (pending === null) {
    return undefined;
  }

  return pending > 0 ? 'broken' : 'ok';
};

const orUnknown = (value: string | null): string => value ?? UNKNOWN_VALUE;

export const databaseViewOf = (status: SystemStatus): DatabaseView => {
  const { database } = status;
  const latency = database.latencyMs === null ? null : `${formatCount(database.latencyMs)} ms`;
  const pending =
    database.pendingMigrations === null ? null : formatCount(database.pendingMigrations);
  const size = database.sizeBytes === null ? null : formatBytes(database.sizeBytes);
  const ceiling =
    database.maxConnections === null ? UNKNOWN_VALUE : formatCount(database.maxConnections);
  const connections =
    database.connections === null ? null : `${formatCount(database.connections)} / ${ceiling}`;

  return {
    facts: [
      {
        key: 'reachable',
        label: DATABASE_FACT_LABELS.reachable,
        value: database.isReachable ? YES : NO,
        level: database.isReachable ? 'ok' : 'broken',
      },
      { key: 'latency', label: DATABASE_FACT_LABELS.latency, value: orUnknown(latency) },
      {
        key: 'pending',
        label: DATABASE_FACT_LABELS.pending,
        value: orUnknown(pending),
        level: pendingLevelOf(database.pendingMigrations),
      },
      { key: 'size', label: DATABASE_FACT_LABELS.size, value: orUnknown(size) },
      {
        key: 'connections',
        label: DATABASE_FACT_LABELS.connections,
        value: orUnknown(connections),
      },
      { key: 'version', label: DATABASE_FACT_LABELS.version, value: orUnknown(database.version) },
      {
        key: 'lastMigration',
        label: DATABASE_FACT_LABELS.lastMigration,
        value: orUnknown(database.lastMigration),
      },
    ],
    tables: database.tables.map((table) => ({
      key: table.name,
      label: table.name,
      value: formatBytes(table.sizeBytes),
      meta: rowsAboutOf(table.rowEstimate),
      weight: table.sizeBytes,
    })),
  };
};

export interface MailView {
  pending: string;
  retrying: string;
  aside: string;
}

export const mailViewOf = (status: SystemStatus, nowMs: number): MailView => {
  const oldest = status.mail.oldestPendingAt;
  const waited = oldest === null ? null : (nowMs - new Date(oldest).getTime()) / 1000;

  return {
    pending: formatCount(status.mail.pending),
    retrying: formatCount(status.mail.retrying),
    aside: oldestWaitingOf(waited),
  };
};

export interface AreaRowView {
  area: SystemArea;
  label: string;
  icon: KkIconName;
  meta: string;
  hint: string | undefined;
  hintTone: KkChipTone;
  to: string;
}

export const areaRowsOf = (status: SystemStatus, moment: SystemMoment): AreaRowView[] =>
  AREA_ORDER.map((area) => {
    const level = shownLevelOf(areaLevelOf(status.verdict.reasons, area), moment.isConnected);

    return {
      area,
      label: SECTION_TITLES[area],
      icon: AREA_ICONS[area],
      meta: areaSummaryTextOf(areaSummaryOf(area, status, moment.nowMs)),
      hint: level === 'ok' ? undefined : LEVEL_WORDS[level],
      hintTone: levelChipToneOf(level),
      to: areaPathOf(area),
    };
  });

export interface AreaHeaderView {
  word: string;
  tone: KkChipTone;
  line: string;
}

export const areaHeaderOf = (
  status: SystemStatus,
  moment: SystemMoment,
  area: SystemArea,
): AreaHeaderView => {
  const reasons = status.verdict.reasons.filter((reason) => areaOfCheck(reason.check) === area);
  const level = shownLevelOf(areaLevelOf(reasons, area), moment.isConnected);
  const context = reasonContextOf(status);
  const line =
    reasons.length === 0
      ? AREA_CALM
      : reasons.map((reason) => reasonTextOf(reason, context)).join(' ');

  return { word: LEVEL_WORDS[level], tone: levelChipToneOf(level), line };
};
