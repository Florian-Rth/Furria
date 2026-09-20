import type { KkConfirmFact } from '@furria/ui';
import { relevantSessionYear } from '@/lib/club';
import { formatSessionLabel, formatSessionNumber } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import type { SessionRecordSummary } from './schemas';

const PART_SEPARATOR = ' · ';
const QUOTE_OPEN = '„';
const QUOTE_CLOSE = '“';

export const MANAGE_SESSIONS_TITLE = 'Sessionseinträge';
export const MANAGE_SESSIONS_CREATE_LABEL = 'Session eintragen';
export const MANAGE_SESSIONS_LOADING_LABEL = 'Die Sessionseinträge werden geladen';
export const MANAGE_SESSIONS_ERROR_TITLE = 'SESSIONSEINTRÄGE NICHT GELADEN';
export const MANAGE_SESSIONS_RETRY_LABEL = 'Erneut laden';

export const MANAGE_SESSIONS_EMPTY = {
  title: 'NOCH KEINE SESSION EINGETRAGEN',
  description:
    'Trag die erste Session ein. Das Jahr reicht — Nº, Motto und Sessionslogo kommen, wenn der Verein sie belegen kann.',
};

export const MANAGE_SESSIONS_FOOTNOTE =
  'Lücken gehören dazu: Nº, Motto und Sessionslogo stehen nur da, wo der Verein sie belegen kann. Nichts wird aus dem Nachbareintrag abgeleitet.';

export const SESSION_SPAN_LABEL = 'Session';
export const MISSING_MOTTO_LINE = 'Motto nicht überliefert';

const RELEVANT_SESSION_CHIP: StateChip = { label: 'diese Session', tone: 'accent', dot: true };

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

export const toSessionRowTitle = (record: SessionRecordSummary): string =>
  toSessionMottoLine(record.motto) ?? MISSING_MOTTO_LINE;

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

export const toSessionsIntro = (records: readonly SessionRecordSummary[], today: Date): string => {
  const seasonLabel = toSessionSeasonLabel(relevantSessionYear(today));

  if (records.length === 0) {
    return `Noch ist keine Session eingetragen — auch ${seasonLabel} nicht.`;
  }

  const head =
    records.length === 1
      ? 'Ein Sessionseintrag ist festgehalten.'
      : `${records.length} Sessionseinträge sind festgehalten.`;
  const tail = records.some((record) => isRelevantSession(record, today))
    ? `${seasonLabel} ist dabei.`
    : `Für ${seasonLabel} fehlt der Eintrag noch.`;

  return `${head} ${tail}`;
};

export const toSessionEditActionLabel = (record: SessionRecordSummary): string =>
  `${toSessionRowLabel(record)} bearbeiten`;

export const toSessionDeleteActionLabel = (record: SessionRecordSummary): string =>
  `${toSessionRowLabel(record)} löschen`;

export const DELETE_EYEBROW = 'Sessionseintrag löschen';
export const DELETE_EXPLANATION =
  'Ein Sessionseintrag ist ein Beleg, kein Zeitraum — falsch eingetragen wird er gelöscht, nicht beendet. An der Session selbst ändert das nichts.';

export const toDeleteQuestion = (record: SessionRecordSummary): string =>
  `${toSessionRowLabel(record)} löschen?`;

export const toDeleteConsequence = (record: SessionRecordSummary): string =>
  `${toSessionSeasonLabel(record.startYear)} heißt danach wieder nur nach ihren Daten — ohne Nº, ohne Motto, ohne Sessionslogo.`;

export const toSessionFacts = (record: SessionRecordSummary): KkConfirmFact[] => [
  { label: SESSION_SPAN_LABEL, value: toSessionSeasonLabel(record.startYear) },
  { label: 'Nº', value: toSessionNumberLabel(record.number) ?? '—' },
  { label: 'Motto', value: toSessionMottoLine(record.motto) ?? '—' },
  { label: 'Sessionslogo', value: written(record.logoSvg) === null ? '—' : 'hinterlegt' },
];

export const toSessionCreatedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist eingetragen.`;

export const toSessionSavedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist gespeichert.`;

export const toSessionDeletedMessage = (startYear: number): string =>
  `${toSessionSeasonLabel(startYear)} ist gelöscht.`;

export const hasSessionLogo = (record: SessionRecordSummary): boolean =>
  written(record.logoSvg) !== null;

export const toSessionLogoLabel = (seasonLabel: string): string => `Sessionslogo ${seasonLabel}`;

export const LOGO_FIELD_LABEL = 'Sessionslogo';
export const LOGO_REMOVE_LABEL = 'Sessionslogo entfernen';
export const LOGO_PRESENT_LINE = 'So steht es später neben der Session.';

const LOGO_DROP_HINT =
  'Tippen, um eine SVG-Datei zu wählen. Die Datei bleibt auf deinem Gerät — gespeichert wird nur ihr Inhalt.';
const LOGO_PICK_HINT = 'Tippen, um das Sessionslogo durch ein anderes SVG zu ersetzen.';
const LOGO_RELEASE_HINT = 'Loslassen — wir lesen die Datei hier im Browser.';

export const LOGO_DRAG_HINT = 'Oder zieh die Datei hierher.';

export const toLogoFieldHint = (isOver: boolean, hasLogo: boolean): string => {
  if (isOver) {
    return LOGO_RELEASE_HINT;
  }

  return hasLogo ? LOGO_PICK_HINT : LOGO_DROP_HINT;
};
