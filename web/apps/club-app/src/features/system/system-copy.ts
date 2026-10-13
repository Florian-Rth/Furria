import type {
  KkFilterOption,
  KkHeartbeatState,
  KkIconName,
  KkStatusLevel,
} from '@furria/ui';
import { deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { AreaSummary } from './area-summary';
import type { LogDay, LogTime } from './log-lines';
import type { LogSource, MediaKind, MediaState, VerdictReason } from './schemas';
import type { BoardFigure, ServiceState } from './system-facts';
import {
  formatBytes,
  formatCount,
  formatPercent,
  formatSpan,
  formatVersion,
} from './system-format';
import { reasonCodeOf } from './system-verdict';
import type { SystemArea } from './types';

export const SYSTEM_LEAD =
  'Betriebszustand von Datenbank, Medienverarbeitung, Speicher und Hintergrundaufgaben.';
export const BOARD_LABEL = 'Gesamtzustand';
export const STATUS_LOADING_LABEL = 'Betriebszustand wird geladen';
export const STATUS_FAILED_TITLE = 'BETRIEBSZUSTAND NICHT VERFÜGBAR';
export const STATUS_FAILED_MESSAGE =
  'Der Server hat den Betriebszustand nicht geliefert. Verbindung prüfen und erneut laden.';
export const RETRY_LABEL = 'Erneut laden';
export const SYSTEM_DENIED_MESSAGE = deniedMessageOf(PERMISSION_KEYS.systemView);
export const STAMP_LABEL = 'STÖRUNG';

export const SECTION_TITLES = {
  media: 'Medienverarbeitung',
  storage: 'Speicher',
  services: 'Hintergrundaufgaben',
  database: 'Datenbank',
  mail: 'E-Mail-Versand',
  log: 'Protokoll',
  program: 'Anwendung',
} as const satisfies Record<SystemArea | 'program', string>;

export const AREA_PATHS: Record<SystemArea, string> = {
  media: '/system/media',
  storage: '/system/storage',
  services: '/system/tasks',
  database: '/system/database',
  mail: '/system/mail',
  log: '/system/log',
};

export const OVERVIEW_PATH = '/system';

export const areaPathOf = (area: SystemArea | null): string =>
  area === null ? OVERVIEW_PATH : AREA_PATHS[area];

export const AREA_ORDER: readonly SystemArea[] = [
  'media',
  'storage',
  'services',
  'database',
  'mail',
  'log',
];

export const AREA_ICONS: Record<SystemArea, KkIconName> = {
  media: 'gallery',
  storage: 'archive',
  services: 'reminder',
  database: 'settings',
  mail: 'mail',
  log: 'paragraph',
};

export const AREAS_TITLE = 'Bereiche';
export const HEADER_EYEBROW = 'System';

export const LEVEL_WORDS: Record<KkStatusLevel, string> = {
  ok: 'In Ordnung',
  attention: 'Hinweis',
  broken: 'Störung',
  unknown: 'Unbekannt',
};

export const AREA_CALM = 'Keine Auffälligkeiten. Alle Prüfungen sind bestanden.';

export const AREA_LABELS: Record<SystemArea, string> = {
  database: 'Datenbank',
  media: 'Medienverarbeitung',
  storage: 'Speicher',
  services: 'Hintergrundaufgaben',
  mail: 'E-Mail-Versand',
  log: 'Protokoll',
};

export const VERDICT_WORDS: Record<KkStatusLevel, string> = {
  ok: 'BETRIEBSBEREIT',
  attention: 'HINWEISE',
  broken: 'STÖRUNG',
  unknown: 'UNBEKANNT',
};

export const ROW_WORDS: Record<KkStatusLevel, string> = {
  ok: 'OK',
  attention: 'HINWEIS',
  broken: 'STÖRUNG',
  unknown: 'UNKLAR',
};

const AREA_COUNT_UNITS: Record<SystemArea, string> = {
  database: '',
  media: 'in Arbeit',
  storage: '',
  services: 'mit Hinweis',
  mail: 'in Warteschlange',
  log: 'Fehler',
};

export const figureTextOf = (area: SystemArea, figure: BoardFigure): string => {
  switch (figure.kind) {
    case 'latency':
      return `${formatCount(figure.ms)} ms`;
    case 'unreachable':
      return 'keine Antwort';
    case 'free':
      return `${formatPercent(figure.share)} frei`;
    case 'unmeasured':
      return 'nicht gemessen';
    case 'count':
      return `${formatCount(figure.count)} ${AREA_COUNT_UNITS[area]}`;
  }
};

export const SERVICE_NAMES: Readonly<Record<string, string>> = {
  abandonedUploadSweep: 'Abgebrochene Uploads bereinigen',
  mediaFileReaper: 'Gelöschte Mediendateien entfernen',
  galleryBinPurge: 'Galerie-Papierkorb leeren',
  mailDispatcher: 'E-Mails versenden',
  unconfirmedApplicationPurge: 'Unbestätigte Mitgliedsanträge löschen',
  pastTicketRequestPurge: 'Abgelaufene Kartenanfragen löschen',
  signedOutMailRequestWorker: 'Anmelde-E-Mails ohne Sitzung versenden',
  logEntryPurge: 'Protokoll bereinigen',
  mediaStorageSurvey: 'Speicherbelegung messen',
};

export const serviceNameOf = (job: string): string => SERVICE_NAMES[job] ?? job;

const plural = (count: number, one: string, many: string): string => (count === 1 ? one : many);

const countOf = (value: number | null): number => Math.round(value ?? 0);

const decimalOf = (value: number | null): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value ?? 0);

const spanOf = (value: number | null): string => formatSpan(value ?? 0);

export interface ReasonContext {
  appVersion: string;
  workers: readonly { hostName: string; version: string }[];
}

const workerOfHost = (context: ReasonContext, hostName: string): string => {
  const position = context.workers.findIndex((worker) => worker.hostName === hostName);

  return workerNameOf(position === -1 ? null : position, context.workers.length);
};

const workerVersionOf = (context: ReasonContext, hostName: string): string =>
  context.workers.find((worker) => worker.hostName === hostName)?.version ?? UNKNOWN_VALUE;

export const reasonTextOf = (reason: VerdictReason, context: ReasonContext): string => {
  const count = countOf(reason.value);
  const subject = reason.subject ?? '';

  switch (reasonCodeOf(reason.code)) {
    case 'databaseUnreachable':
      return 'Die Datenbank ist nicht erreichbar. Die Anwendung kann weder Daten lesen noch speichern.';
    case 'pendingMigrations':
      return `${plural(count, 'Eine Schema-Migration ist', `${count} Schema-Migrationen sind`)} noch nicht angewendet. Der Server muss neu gestartet werden.`;
    case 'slowDatabase':
      return `Die Datenbank antwortet verzögert (${count} ms, üblich sind unter 200 ms).`;
    case 'workerStale':
      return `${workerOfHost(context, subject)} (Host ${subject}) hat sich seit ${spanOf(reason.value)} nicht gemeldet. Neue Medien werden womöglich nicht verarbeitet.`;
    case 'noLiveWorker':
      return 'Es läuft kein Verarbeitungsdienst, obwohl Bilder oder Videos auf ihre Verarbeitung warten.';
    case 'workerVersionMismatch':
      return `${workerOfHost(context, subject)} (Host ${subject}) läuft mit Version ${formatVersion(workerVersionOf(context, subject))}, der Server mit ${formatVersion(context.appVersion)}. Beide sollten dieselbe Version haben – den Verarbeitungsdienst aktualisieren.`;
    case 'queueWaiting':
      return `Der älteste Verarbeitungsauftrag wartet seit ${spanOf(reason.value)}.`;
    case 'diskLow':
      return `Auf dem Medienspeicher sind nur noch ${decimalOf(reason.value)} % frei.`;
    case 'storageUnmeasured':
      return reason.value === null
        ? 'Die Speicherbelegung wurde seit dem Serverstart noch nicht gemessen.'
        : `Die Speicherbelegung wurde seit ${spanOf(reason.value)} nicht gemessen.`;
    case 'mediaFailed':
      return `${plural(count, 'Eine Mediendatei konnte', `${count} Mediendateien konnten`)} in den letzten 24 Std nicht verarbeitet werden.`;
    case 'errorsLogged':
      return `Das Protokoll enthält ${plural(count, 'einen Fehler', `${count} Fehler`)} aus den letzten 24 Std.`;
    case 'errorBurst':
      return `In der letzten Stunde ${plural(count, 'wurde ein Fehler', `wurden ${count} Fehler`)} protokolliert.`;
    case 'serviceOverdue':
      return `„${serviceNameOf(subject)}“ ist seit ${spanOf(reason.value)} überfällig.`;
    case 'serviceFailed':
      return count > 1
        ? `„${serviceNameOf(subject)}“ ist ${count}-mal in Folge fehlgeschlagen.`
        : `„${serviceNameOf(subject)}“ ist beim letzten Lauf fehlgeschlagen.`;
    case 'mailRetrying':
      return `${plural(count, 'Eine E-Mail konnte', `${count} E-Mails konnten`)} nicht zugestellt werden und ${plural(count, 'wird', 'werden')} erneut versucht.`;
    case 'mailStuck':
      return `Die älteste E-Mail wartet seit ${spanOf(reason.value)} auf den Versand.`;
    case 'unknown':
      return 'Eine Prüfung hat einen unbekannten Hinweis gemeldet.';
  }
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = { photo: 'Fotos', video: 'Videos' };

export const MEDIA_STATE_LABELS: Record<MediaState, string> = {
  ready: 'Bereit',
  processing: 'In Arbeit',
  failed: 'Fehlgeschlagen',
};

export const MEDIA_GRID_LABEL = 'Mediendateien nach Verarbeitungsstand';
export const QUEUE_LABEL = 'Warteschlange';
export const WORKERS_EMPTY =
  'Es ist kein Verarbeitungsdienst angemeldet. Neue Bilder und Videos werden erst verarbeitet, wenn einer läuft.';
export const FAILED_TITLE = 'Zuletzt fehlgeschlagene Verarbeitungen';
export const NOTHING_WAITING = 'Warteschlange leer';

export const oldestWaitingOf = (seconds: number | null): string =>
  seconds === null ? NOTHING_WAITING : `Ältester Auftrag wartet seit ${formatSpan(seconds)}`;

export const HEARTBEAT_WORDS: Record<KkHeartbeatState, string> = {
  alive: 'aktiv',
  stale: 'verzögert',
  gone: 'getrennt',
};

export const ACCELERATION_NONE = 'Software-Kodierung';

const WORKER_NAME = 'Verarbeitungsdienst';

export const workerNameOf = (position: number | null, count: number): string =>
  position === null || count <= 1 ? WORKER_NAME : `${WORKER_NAME} ${position + 1}`;

export const workerMetaOf = (
  hostName: string,
  version: string,
  acceleration: string | null,
  photoItem: number | null,
  videoItem: number | null,
): string[] => [
  `Host ${hostName}`,
  `Version ${version}`,
  acceleration === null ? ACCELERATION_NONE : `Hardware-Kodierung ${acceleration}`,
  ...(photoItem === null ? [] : [`verarbeitet Foto #${photoItem}`]),
  ...(videoItem === null ? [] : [`verarbeitet Video #${videoItem}`]),
];

export const STORAGE_LABEL = 'Speicherbelegung des Medienverzeichnisses';
export const STORAGE_PART_LABELS = {
  originals: 'Originale',
  renditions: 'Bildgrößen & Videofassungen',
  staging: 'Laufende Uploads',
  other: 'Sonstiges',
  free: 'Frei',
} as const;
export const STORAGE_UNMEASURED = 'Noch nicht gemessen';

export const measuredAgoOf = (seconds: number): string => `gemessen vor ${formatSpan(seconds)}`;

export const filesOf = (bytes: number, files: number): string =>
  `${formatBytes(bytes)} · ${formatCount(files)} ${plural(files, 'Datei', 'Dateien')}`;

export const SERVICES_LABEL = 'Hintergrundaufgaben';
export const ON_DEMAND_LABEL = 'bei Bedarf';
export const punctualFoldOf = (count: number): string =>
  `${count} ${plural(count, 'Aufgabe läuft', 'Aufgaben laufen')} planmäßig`;

export const SERVICE_STATE_WORDS: Record<ServiceState, string> = {
  onDemand: 'bei Bedarf',
  punctual: 'planmäßig',
  overdue: 'überfällig',
  failed: 'fehlgeschlagen',
};

export const DATABASE_FACT_LABELS = {
  reachable: 'Erreichbar',
  latency: 'Antwortzeit',
  pending: 'Ausstehende Schema-Migrationen',
  size: 'Größe',
  connections: 'Verbindungen',
  version: 'PostgreSQL-Version',
  lastMigration: 'Letzte Migration',
} as const;
export const TABLES_LABEL = 'Größte Tabellen';
export const YES = 'ja';
export const NO = 'nein';
export const UNKNOWN_VALUE = '–';

export const rowsAboutOf = (rows: number): string => `ca. ${formatCount(rows)} Zeilen`;

export const MAIL_FACT_LABELS = { pending: 'In Warteschlange', retrying: 'Erneuter Versuch' } as const;

export const LOG_LABEL = 'Anwendungsprotokoll';
export const LOG_SOURCE_LABEL = 'Quelle';
export const LOG_LEVEL_LABEL = 'Schweregrad';
export const LOG_SEARCH_LABEL = 'Im Protokoll suchen';
export const LOG_SEARCH_CLEAR = 'Suche leeren';
export const LOG_MORE_LABEL = 'Ältere laden';
export const LOG_EXCEPTION_LABEL = 'Fehlerdetails';
export const LOG_EMPTY_TITLE = 'Keine Einträge';
export const LOG_EMPTY_DESCRIPTION = 'Für diese Auswahl gibt es keine Einträge.';
export const LOG_FAILED = 'Das Protokoll konnte nicht geladen werden.';
export const LOG_LOADING_LABEL = 'Protokoll wird geladen';

export const LOG_SOURCE_OPTIONS: readonly KkFilterOption[] = [
  { id: 'all', label: 'Alle' },
  { id: 'api', label: 'Server' },
  { id: 'mediaWorker', label: 'Verarbeitungsdienst' },
];

export const LOG_LEVEL_OPTIONS: readonly KkFilterOption[] = [
  { id: 'information', label: 'ab Info' },
  { id: 'warning', label: 'ab Warnung' },
  { id: 'error', label: 'nur Fehler' },
];

export const LOG_SOURCE_CHIPS: Record<LogSource, string> = {
  api: 'Server',
  mediaWorker: 'Verarbeitung',
};

export const freshLabelOf = (count: number): string => `${count} neue`;

export const logsSinceOf = (since: string | null, format: (moment: Date) => string): string =>
  since === null ? 'Noch keine Einträge' : `Einträge seit ${format(new Date(since))}`;

export const logTimeTextOf = (time: LogTime): string => {
  switch (time.kind) {
    case 'now':
      return 'gerade';
    case 'minutes':
      return `vor ${time.minutes} Min`;
    case 'clock':
      return time.clock;
  }
};

export const logDayTextOf = (day: LogDay, date: string): string => {
  switch (day) {
    case 'today':
      return 'Heute';
    case 'yesterday':
      return 'Gestern';
    case 'earlier':
      return date;
  }
};

export const repeatTextOf = (count: number, from: string, to: string): string =>
  `×${count} · ${from}–${to}`;

export const PROGRAM_FACT_LABELS = {
  version: 'Version',
  environment: 'Umgebung',
  runningSince: 'Gestartet',
  serverTime: 'Serverzeit',
} as const;

export const offlineSinceOf = (clock: string): string => `Keine Verbindung seit ${clock}`;

const workersText = (alive: number): string =>
  alive === 0
    ? 'kein Verarbeitungsdienst aktiv'
    : `${alive} ${plural(alive, 'Verarbeitungsdienst', 'Verarbeitungsdienste')} aktiv`;

const waitingText = (waiting: number, running: number): string => {
  if (waiting === 0 && running === 0) {
    return 'Warteschlange leer';
  }

  return `${formatCount(running)} in Arbeit · ${formatCount(waiting)} wartend`;
};

export const areaSummaryTextOf = (summary: AreaSummary): string => {
  switch (summary.kind) {
    case 'media':
      return [
        workersText(summary.aliveWorkers),
        waitingText(summary.waiting, summary.running),
      ].join(' · ');
    case 'storage': {
      const free =
        summary.freeShare === null
          ? 'Belegung unbekannt'
          : `${formatPercent(summary.freeShare)} frei`;
      const measured =
        summary.measuredAgoSeconds === null
          ? 'noch nie gemessen'
          : measuredAgoOf(summary.measuredAgoSeconds);

      return `${free} · ${measured}`;
    }
    case 'services': {
      const failed = summary.failed === 0 ? '' : ` · ${summary.failed} fehlgeschlagen`;

      return `${summary.punctual} planmäßig · ${summary.overdue} überfällig${failed}`;
    }
    case 'database': {
      if (!summary.isReachable) {
        return 'nicht erreichbar';
      }

      const latency =
        summary.latencyMs === null ? UNKNOWN_VALUE : `${formatCount(summary.latencyMs)} ms`;
      const size = summary.sizeBytes === null ? UNKNOWN_VALUE : formatBytes(summary.sizeBytes);

      return `${latency} · ${size}`;
    }
    case 'mail': {
      if (summary.pending === 0) {
        return 'Warteschlange leer';
      }

      return `${formatCount(summary.pending)} in Warteschlange · ${formatCount(summary.retrying)} erneuter Versuch`;
    }
    case 'log':
      return `${formatCount(summary.errors)} Fehler in den letzten 24 Std`;
  }
};
