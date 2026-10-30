import type { ReadinessCheck } from '@/features/season/schemas';
import type { CheckMark, DotKind } from './season-c-rows';

export const SCREEN_TITLE = 'Saison';
export const FILTER_LABEL = 'Auftritte filtern';
export const FILTER_OPEN = 'Nicht fertig';
export const FILTER_ALL = 'Alle';
export const SESSION_LABEL = 'Session';
export const GRID_LABEL = 'Auftritte nach Stand und Abenden';
export const ACTS_HEAD = 'Auftritt';
export const LEGEND_LABEL = 'Zeichen';
export const LEGEND_PLACED = 'Nr. im Ablauf';
export const LEGEND_TRAY = 'in der Ablage';
export const LEGEND_ADJUSTED = 'angepasst';
export const LOAD_FAILED_TITLE = 'Saison nicht geladen';
export const LOAD_FAILED_TEXT = 'Die Auftritte und Abende konnten nicht geladen werden.';
export const RETRY = 'Erneut laden';
export const EMPTY_TITLE = 'Alles fertig';
export const EMPTY_TEXT = 'Kein Auftritt in dieser Auswahl hat noch etwas offen.';
export const PANE_LABEL = 'Auftritt im Detail';
export const CLOSE = 'Schließen';
export const MISSING_TITLE = 'Was fehlt';
export const EVENINGS_TITLE = 'Abende';
export const CAST_LABEL = 'Besetzung an diesem Abend';
export const CAST_ADD = 'Einspringer';
export const CAST_ADD_DONE = 'Fertig';
export const CHECK_DONE = 'da';
export const CHECK_OPEN = 'fehlt';
export const CONFIRMED = 'Ablauf steht';
export const NOT_CONFIRMED = 'offen';
export const CAST_CHANGE = 'Besetzung ändern';
export const CAST_CLOSE = 'Zuklappen';

export const CHECK_WORDS: Record<CheckMark, string> = {
  done: CHECK_DONE,
  open: CHECK_OPEN,
  none: 'entfällt',
};

export const CHECK_LABELS: Record<ReadinessCheck, string> = {
  music: 'Musik',
  steps: 'Schritte',
  formation: 'Aufstellung',
  videos: 'Video',
  finalFile: 'Endfassung',
  cast: 'Besetzung',
};

const WEEKDAY = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
const DATE = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });

export const toEveningDay = (startsAt: string): string => {
  const date = new Date(startsAt);

  return `${WEEKDAY.format(date).replace('.', '')} ${DATE.format(date)}`;
};

export const toScreenHeading = (sessionYear: number | null): string =>
  sessionYear === null ? 'Saison planen' : `Saison ${sessionYear} planen`;

export const toSessionLabel = (year: number): string => `${year}/${String(year + 1).slice(2)}`;

export const toReadinessText = (done: number, total: number): string => `${done}/${total}`;

export const toReadinessLabel = (name: string, done: number, total: number): string =>
  `${name}: ${done} von ${total} fertig. Details`;

export const toActMeta = (group: string | null, castCount: number): string =>
  [group, `${castCount} Pers.`].filter((part) => part !== null).join(' · ');

export const toEveningPlace = (place: number, total: number): string =>
  `Abend ${place} von ${total} · wischen`;

export const toEveningCount = (placed: number, tray: number): string =>
  tray === 0 ? `${placed} Auftritte` : `${placed} + ${tray} Ablage`;

export const toDotText = (kind: DotKind, number: number | null): string =>
  kind === 'placed' || kind === 'adjusted' ? String(number ?? '') : '';

const DOT_STATE: Record<DotKind, string> = {
  placed: 'im Ablauf',
  tray: 'in der Ablage',
  adjusted: 'angepasst',
  none: 'nicht dabei',
};

export const toDotLabel = (
  actName: string,
  eveningTitle: string,
  kind: DotKind,
  number: number | null,
): string => {
  const position = number === null ? '' : ` als Nr. ${number}`;
  const deed = kind === 'none' ? 'Einplanen' : 'Herausnehmen';

  return `${actName} · ${eveningTitle}: ${DOT_STATE[kind]}${position}. ${deed}`;
};

export const toPaneEyebrow = (group: string | null, ready: number, total: number): string =>
  [group, `${ready} von ${total} fertig`].filter((part) => part !== null).join(' · ');

export const toEveningRowMeta = (kind: DotKind, number: number | null): string => {
  if (kind === 'none') {
    return 'nicht dabei';
  }
  const position = number === null ? 'in der Ablage' : `Nr. ${number}`;

  return kind === 'adjusted' ? `${position} · angepasst` : position;
};

export const toCastChangeLine = (out: readonly string[], standIn: readonly string[]): string => {
  const parts = [
    out.length === 0 ? null : `fehlt: ${out.join(', ')}`,
    standIn.length === 0 ? null : `springt ein: ${standIn.join(', ')}`,
  ].filter((part) => part !== null);

  return parts.length === 0 ? 'wie in der Session' : parts.join(' · ');
};
