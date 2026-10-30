import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import type { ReadinessCheck } from '@/features/season/schemas';
import type { Readiness, SeasonCell } from '@/features/season/season-grid';
import { sessionYearsLabelOf } from '@/lib/club';

export const SEASON_A_TITLE = 'Saison planen';
export const RASTER_LABEL = 'Auftritte und Abende der Session';
export const SESSION_CHOICE_LABEL = 'Session wählen';
export const ORDER_CHOICE_LABEL = 'Auftritte ordnen';
export const PANE_LABEL = 'Auftritt an diesem Abend';
export const PANE_CLOSE = 'Schließen';
export const UNGROUPED = 'Ohne Gruppe';
export const PREVIOUS_EVENING = 'Vorheriger Abend';
export const NEXT_EVENING = 'Nächster Abend';
export const RUNNING_ORDER_CONFIRMED = 'Ablauf steht';
export const RUNNING_ORDER_OPEN = 'Ablauf offen';
export const RUNNING_ORDER_NONE = 'Kein Ablauf';
export const READINESS_TITLE = 'Stand';
export const CAST_TITLE = 'Besetzung an diesem Abend';
export const CAST_LABEL = 'Besetzung an diesem Abend — antippen setzt aus oder holt zurück';
export const CAST_ADD = 'Einspringen lassen';
export const CAST_ADD_DONE = 'Fertig';
export const CAST_NOT_ON_EVENING =
  'Der Auftritt steht nicht auf diesem Abend. Erst einplanen, dann die Besetzung ändern.';
export const CAST_EMPTY = 'Für diesen Auftritt ist noch niemand besetzt.';
export const ADD_TO_EVENING = 'Einplanen';
export const REMOVE_FROM_EVENING = 'Herausnehmen';
export const LOAD_FAILED_TITLE = 'Saison nicht geladen';
export const LOAD_FAILED_TEXT = 'Die Auftritte der Session konnten nicht geladen werden.';
export const RETRY = 'Nochmal laden';
export const EMPTY_TITLE = 'Noch keine Auftritte';
export const EMPTY_TEXT = 'Für diese Session gibt es noch keine Auftritte oder Abende.';
export const IN_TRAY = 'Ablage';
export const OUT_TILE = 'setzt aus';
export const IN_TILE = 'tanzt mit';
export const GUEST_TILE = 'springt ein';
export const GUEST_BADGE = 'Gast';
export const READY_LINE = 'bereit';
export const OPEN_LINE = 'offen';

export const ORDER_OPTIONS: readonly KkFilterOption[] = [
  { id: 'group', label: 'Nach Gruppe' },
  { id: 'ready', label: 'Nach Stand' },
  { id: 'name', label: 'A–Z' },
];

const READINESS_LABELS: Record<ReadinessCheck, string> = {
  music: 'Musik',
  steps: 'Schritte',
  formation: 'Aufstellung',
  videos: 'Videos',
  finalFile: 'Endfassung',
  cast: 'Besetzung',
};

const DAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});

export const toReadinessLabel = (check: ReadinessCheck): string => READINESS_LABELS[check];

export const toSeasonTitle = (sessionYear: number): string =>
  `Session ${sessionYearsLabelOf(sessionYear)}`;

export const toSessionOption = (sessionYear: number): KkFilterOption => ({
  id: String(sessionYear),
  label: sessionYearsLabelOf(sessionYear),
});

export const toRasterMeta = (acts: number, evenings: number): string =>
  `${acts} Auftritte · ${evenings} Abende`;

export const toEveningDay = (startsAt: string): string => DAY.format(new Date(startsAt));

export const toEveningTally = (placed: number, tray: number): string =>
  tray === 0 ? `${placed} im Ablauf` : `${placed} im Ablauf · ${tray} Ablage`;

export const toEveningPosition = (index: number, count: number): string =>
  `Abend ${index + 1} von ${count}`;

export const toReadinessText = ({ done, total }: Readiness): string => `${done}/${total}`;

export const toOpenChecks = (readiness: Readiness): string =>
  readiness.ready ? 'Alles bereit' : `Offen: ${readiness.open.map(toReadinessLabel).join(', ')}`;

export const toReadinessLabelOf = (name: string, readiness: Readiness): string =>
  `${name}: ${readiness.done} von ${readiness.total} bereit. ${toOpenChecks(readiness)}`;

export const toActMeta = (groupName: string | null, evenings: number): string => {
  const count = evenings === 1 ? '1 Abend' : `${evenings} Abende`;

  return groupName === null ? count : `${groupName} · ${count}`;
};

export const toGroupHead = (name: string | null, count: number): string =>
  `${name ?? UNGROUPED} · ${count}`;

export const toCellText = (cell: SeasonCell): string =>
  cell.number === null ? IN_TRAY : `Nr. ${cell.number}`;

export const toCellLabel = (actName: string, eveningTitle: string, cell: SeasonCell): string => {
  const adjusted = cell.adjusted ? ', für den Abend angepasst' : '';

  if (cell.state === 'none') {
    return `${actName} auf ${eveningTitle} einplanen`;
  }
  if (cell.state === 'tray') {
    return `${actName} in der Ablage von ${eveningTitle}${adjusted} — herausnehmen`;
  }

  return `${actName} auf ${eveningTitle}, Nr. ${cell.number}${adjusted} — herausnehmen`;
};

export const toDetailsLabel = (actName: string, eveningTitle: string): string =>
  `${actName} auf ${eveningTitle}: Besetzung und Stand`;

export const toCellState = (cell: SeasonCell): string => {
  if (cell.state === 'none') {
    return 'Nicht eingeplant';
  }

  const base = cell.state === 'tray' ? 'In der Ablage' : `Nr. ${cell.number} im Ablauf`;

  return cell.adjusted ? `${base} · angepasst` : base;
};

export const toCastSummary = (out: number, standIns: number): string => {
  if (out === 0 && standIns === 0) {
    return 'Wie in der Session';
  }

  const parts = [
    out === 0 ? null : `${out} setzt aus`,
    standIns === 0 ? null : `${standIns} springt ein`,
  ].filter((part) => part !== null);

  return parts.join(' · ');
};

export const toPaneMeta = (eveningTitle: string, startsAt: string): string =>
  `${eveningTitle} · ${toEveningDay(startsAt)}`;
