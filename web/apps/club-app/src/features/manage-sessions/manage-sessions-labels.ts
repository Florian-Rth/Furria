import type { KkConfirmFact, KkScreenOrigin } from '@furria/ui';
import { relevantSessionYear } from '@/lib/club';
import { formatSessionLabel, formatSessionNumber } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import type { SessionRecordSummary } from './schemas';

const PART_SEPARATOR = ' · ';
const QUOTE_OPEN = '„';
const QUOTE_CLOSE = '“';

export const MANAGE_SESSIONS_TITLE = 'Sessionseinträge';
export const MANAGE_SESSIONS_CREATE_LABEL = 'Session hinzufügen';
export const MANAGE_SESSIONS_LOADING_LABEL = 'Die Sessionseinträge werden geladen';
export const MANAGE_SESSIONS_ERROR_TITLE = 'SESSIONSEINTRÄGE NICHT GELADEN';
export const MANAGE_SESSIONS_RETRY_LABEL = 'Erneut laden';

export const SESSIONS_ORIGIN: KkScreenOrigin = {
  label: MANAGE_SESSIONS_TITLE,
  to: '/manage/sessions',
};

const SESSION_RECORD_ID_PATTERN = /^[1-9]\d*$/;

export const toSessionRecordId = (raw: string): number | null =>
  SESSION_RECORD_ID_PATTERN.test(raw) ? Number(raw) : null;

export const findSessionRecord = (
  records: readonly SessionRecordSummary[],
  sessionId: number | null,
): SessionRecordSummary | null => {
  if (sessionId === null) {
    return null;
  }

  return records.find((record) => record.sessionId === sessionId) ?? null;
};

export const SESSION_NOT_FOUND_TITLE = 'NICHT MEHR DA';
export const SESSION_NOT_FOUND_DESCRIPTION = 'Diesen Sessionseintrag gibt es nicht mehr.';

export const SESSION_EDITOR_DENIED_MESSAGE =
  'Dir fehlt die Berechtigung für Vereinsdaten, Sessions und Orte.';

export const MANAGE_SESSIONS_FOOTNOTE =
  'Trage nur ein, was belegt ist – durch Orden, Banner oder Festschrift. Nichts wird aus benachbarten Sessions abgeleitet.';

export const SESSION_SECTION_TITLES = {
  ahead: 'Aktuell',
  past: 'Frühere Sessions',
} as const;

export const VACANT_SESSION_LINE = 'Noch kein Sessionseintrag';

export interface SessionRecordPartition {
  ahead: SessionRecordSummary[];
  past: SessionRecordSummary[];
  vacantYear: number | null;
}

export const partitionSessionRecords = (
  records: readonly SessionRecordSummary[],
  today: Date,
): SessionRecordPartition => {
  const relevantYear = relevantSessionYear(today);
  const ahead = records.filter((record) => record.startYear >= relevantYear);
  const past = records.filter((record) => record.startYear < relevantYear);
  const relevantRecorded = ahead.some((record) => record.startYear === relevantYear);

  return { ahead, past, vacantYear: relevantRecorded ? null : relevantYear };
};

export const SESSION_SPAN_LABEL = 'Session';
const MOTTO_UNRECORDED_LINE = 'Motto nicht überliefert';
const MOTTO_PENDING_LINE = 'Das Motto steht noch aus';

export const RELEVANT_SESSION_CHIP: StateChip = {
  label: 'diese Session',
  tone: 'accent',
  dot: true,
};

const written = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

export const toSessionSeasonLabel = (startYear: number): string => formatSessionLabel(startYear);

export const toSessionNumberLabel = (number: number | null): string | null =>
  number === null ? null : formatSessionNumber(number);

export const toSessionMottoLine = (motto: string | null): string | null => {
  const spoken = written(motto);

  return spoken === null ? null : `${QUOTE_OPEN}${spoken}${QUOTE_CLOSE}`;
};

export interface SessionRowMotto {
  line: string;
  missing: boolean;
}

export const toSessionRowMotto = (record: SessionRecordSummary, today: Date): SessionRowMotto => {
  const mottoLine = toSessionMottoLine(record.motto);

  if (mottoLine !== null) {
    return { line: mottoLine, missing: false };
  }

  const stillAhead = record.startYear >= relevantSessionYear(today);

  return { line: stillAhead ? MOTTO_PENDING_LINE : MOTTO_UNRECORDED_LINE, missing: true };
};

export const toSessionRowLabel = (record: SessionRecordSummary): string => {
  const parts = [toSessionSeasonLabel(record.startYear)];
  const numberLabel = toSessionNumberLabel(record.number);
  const mottoLine = toSessionMottoLine(record.motto);

  if (numberLabel !== null) {
    parts.push(numberLabel);
  }
  if (mottoLine !== null) {
    parts.push(mottoLine);
  }

  return parts.join(PART_SEPARATOR);
};

export const isRelevantSession = (record: SessionRecordSummary, today: Date): boolean =>
  record.startYear === relevantSessionYear(today);

export const toSessionRowChip = (record: SessionRecordSummary, today: Date): StateChip | null =>
  isRelevantSession(record, today) ? RELEVANT_SESSION_CHIP : null;

export const SESSIONS_LEAD = 'Sessionsnummer, Motto und Sessionslogo jeder Session.';
export const DELETE_EYEBROW = 'Sessionseintrag löschen';
export const DELETE_EXPLANATION = 'Fehlerhafte Sessionseinträge werden gelöscht, nicht archiviert.';

export const toDeleteQuestion = (record: SessionRecordSummary): string =>
  `${toSessionRowLabel(record)} löschen?`;

export const toDeleteConsequence = (record: SessionRecordSummary): string =>
  `${toSessionSeasonLabel(record.startYear)} wird danach ohne Sessionsnummer, Motto und Sessionslogo angezeigt.`;

export const toSessionFacts = (record: SessionRecordSummary): KkConfirmFact[] => [
  { label: SESSION_SPAN_LABEL, value: toSessionSeasonLabel(record.startYear) },
  { label: 'Sessionsnummer', value: toSessionNumberLabel(record.number) ?? '—' },
  { label: 'Motto', value: toSessionMottoLine(record.motto) ?? '—' },
  { label: 'Sessionslogo', value: written(record.logoSvg) === null ? '—' : 'hinterlegt' },
];

export const toSessionCreatedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist eingetragen.`;

export const toSessionSavedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist gespeichert.`;

export const toSessionDeletedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist gelöscht.`;

export const toSessionLogoLabel = (seasonLabel: string): string => `Sessionslogo ${seasonLabel}`;

export const LOGO_FIELD_LABEL = 'Sessionslogo';
export const LOGO_REMOVE_LABEL = 'Sessionslogo entfernen';
export const LOGO_PRESENT_LINE = 'So erscheint es neben der Session.';

const LOGO_DROP_HINT = 'Tippen, um eine SVG-Datei auszuwählen.';
const LOGO_PICK_HINT = 'Tippen, um das Sessionslogo durch ein anderes SVG zu ersetzen.';
const LOGO_RELEASE_HINT = 'Zum Hochladen loslassen.';

export const LOGO_DRAG_HINT = 'Oder Datei hierher ziehen.';

export const toLogoFieldHint = (isOver: boolean, hasLogo: boolean): string => {
  if (isOver) {
    return LOGO_RELEASE_HINT;
  }

  return hasLogo ? LOGO_PICK_HINT : LOGO_DROP_HINT;
};
