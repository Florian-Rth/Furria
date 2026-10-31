import type { KkChipTone } from '@furria/ui/KkChip';
import type { KkIconName } from '@furria/ui/KkIcon';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { ActKind, ActWishKind, Strength } from '@/features/running-order/schemas';
import { sessionYearsLabelOf } from '@/lib/club';
import type { CastTally, CastTileState } from './act-cast';
import type { NameIssue } from './act-editor';
import type { HistoryActMark, SessionPhase } from './act-history';
import type { ActsFilter, GroupAct } from './schemas';

export const ACTS_TITLE = 'Sessionsauftritte';
export const GROUP_ACTS_TITLE = 'Sessionsauftritte';
export const NEW_ACT_LABEL = 'Neuer Sessionsauftritt';
export const NEW_ACT_TITLE = 'Neuer Sessionsauftritt';
export const SEARCH_PLACEHOLDER = 'Sessionsauftritt, Gruppe oder Person';
export const LOADING_LABEL = 'Sessionsauftritte werden geladen';
export const RETRY_LABEL = 'Erneut laden';
export const LIST_LABEL = 'Sessionsauftritte nach Gruppen';
export const POINTS_TITLE = 'Ablaufpunkte';
export const POINT_CONTEXT = 'Ablaufpunkt';
export const OPEN_LABEL = 'Öffnen';
export const CLOSE_LABEL = 'Schließen';
export const NONE = 'keine';
export const EMPTY_FILTER_NOTE = 'Hier gibt es keine Sessionsauftritte.';
export const HEALTH_LABEL = 'Überblick der Sessionsauftritte';
export const FILTER_LABEL = 'Sessionsauftritte filtern';
export const SHARED_TITLE = 'Gemeinsame Leute';
export const CARRIERS_LABEL = 'Mehrfach dabei';
export const SPOTLIGHT_PRESS_LABEL = 'Sessionsauftritte hervorheben von';
export const SPOTLIGHT_CLEAR_LABEL = 'Aufheben';
export const NAME_LABEL = 'Name des Sessionsauftritts';
export const NAME_PLACEHOLDER = 'z. B. Gardemarsch';
export const KIND_CHOICE_LABEL = 'Art des Sessionsauftritts';
export const SESSION_CHOICE_LABEL = 'Session des Sessionsauftritts';
export const SESSIONS_LABEL = 'Session wählen';

export const toSessionLabel = (sessionYear: number): string =>
  `Session ${sessionYearsLabelOf(sessionYear)}`;

export const toClosedActNote = (sessionYear: number | null): string =>
  sessionYear === null
    ? 'Dieser Sessionsauftritt bleibt, wie er war.'
    : `Die Session ${sessionYearsLabelOf(sessionYear)} ist vorbei – der Sessionsauftritt bleibt, wie er war.`;

export const toClosedSessionNote = (sessionYear: number): string =>
  `Die Session ${sessionYearsLabelOf(sessionYear)} ist vorbei – ihre Sessionsauftritte bleiben, wie sie waren.`;
export const GROUP_TITLE = 'Gruppe';
export const GROUP_FIELD_LABEL = 'Gruppe';
export const NO_GROUP_OPTION = 'Keine Gruppe';
export const CAST_TITLE = 'Besetzung';
export const CAST_LABEL = 'Wer steht drin';
export const ADD_GUEST_LABEL = 'Gast';
export const ADD_PERSON_LABEL = 'Person';
export const GUEST_BADGE = 'Gast';
export const GUEST_SEARCH_TITLE = 'Wer kommt dazu?';
export const GUEST_SEARCH_DONE = 'Fertig';
export const WISHES_TITLE = 'Wünsche';
export const NEW_WISH_LABEL = 'Wunsch hinzufügen';
export const WISH_STRENGTH_LABEL = 'Wie fest?';
export const WISH_KIND_LABEL = 'Wann?';
export const REMOVE_WISH_LABEL = 'Wunsch entfernen';
export const SHARED_ACTS_LABEL = 'Sessionsauftritte mit gemeinsamen Leuten';
export const SAVE_LABEL = 'Speichern';
export const CREATE_LABEL = 'Anlegen';
export const ARCHIVE_LABEL = 'Archivieren';
export const RESTORE_LABEL = 'Wiederherstellen';
export const ARCHIVED_NOTE = 'Archiviert — taucht in keinem neuen Ablauf auf.';
export const MEMBERS_LOADING = 'Mitglieder werden geladen';

const FILTER_LABELS: Record<ActsFilter, string> = {
  all: 'Alle',
  dance: 'Tänze',
  speech: 'Reden',
  music: 'Musik',
  show: 'Shows',
  points: 'Ablaufpunkte',
  archive: 'Archiv',
};

export const FILTER_ICONS: Record<ActsFilter, KkIconName> = {
  all: 'list',
  dance: 'stage',
  speech: 'campaign',
  music: 'music',
  show: 'sparkle',
  points: 'flag',
  archive: 'archive',
};

export const toFilterLabel = (filter: ActsFilter): string => FILTER_LABELS[filter];

export const toFilterAriaLabel = (filter: ActsFilter, count: number): string =>
  `${FILTER_LABELS[filter]}: ${count === 0 ? NONE : count}`;

export const KIND_ICONS: Record<ActKind, KkIconName> = {
  dance: 'stage',
  speech: 'campaign',
  music: 'music',
  show: 'sparkle',
  point: 'flag',
};

export const META_SEPARATOR = ' · ';

export const countOf = (value: number, one: string, many: string): string =>
  `${value} ${value === 1 ? one : many}`;

export const toCastFact = (present: number): string =>
  present === 0 ? 'niemand eingetragen' : `${present} dabei`;

export const toRunsFact = (runs: number): string =>
  runs === 1 ? 'in 1 Ablauf' : `in ${runs} Abläufen`;

export const toOverlapLabel = (shared: number, total: number): string =>
  shared === 0
    ? 'Niemand steht auch woanders'
    : `${shared} von ${total} ${shared === 1 ? 'steht' : 'stehen'} auch woanders`;

export const toOverlapCaption = (shared: number): string =>
  shared === 0 ? 'nur hier' : 'auch woanders';

export const toCarriersRingLabel = (carriers: number, people: number): string =>
  `${carriers} von ${people} Leuten stehen in mehreren Sessionsauftritten`;

export const toCarriersLegend = (carriers: number): string => `${carriers} mehrfach`;

export const toSinglesLegend = (singles: number): string => `${singles} nur einmal`;

export const toSpotlightLine = (name: string, acts: number): string =>
  `${name} steht in ${countOf(acts, 'Sessionsauftritt', 'Sessionsauftritten')}`;

export const toSharedActMeta = (shared: number): string =>
  `${shared} ${shared === 1 ? 'Person' : 'Leute'} gemeinsam`;

export const toCastTallyLine = (tally: CastTally, grouped: boolean): string => {
  if (!grouped) {
    return tally.present === 0 ? 'Niemand eingetragen' : `${tally.present} dabei`;
  }

  const parts = [
    `${tally.present} dabei`,
    tally.out === 0 ? null : `${tally.out} nicht dabei`,
    tally.guests === 0 ? null : countOf(tally.guests, 'Gast', 'Gäste'),
  ].filter((part): part is string => part !== null);

  return parts.join(' · ');
};

const TILE_STATE_LABELS: Record<CastTileState, string> = {
  in: 'dabei',
  out: 'nicht dabei',
  guest: 'Gast, dabei',
  person: 'dabei',
};

export const toTileStateLabel = (state: CastTileState): string => TILE_STATE_LABELS[state];

const NAME_ISSUES: Record<NameIssue, string> = {
  missing: 'Der Sessionsauftritt braucht einen Namen.',
  tooLong: 'Höchstens 80 Zeichen.',
};

export const toNameIssueText = (issue: NameIssue): string => NAME_ISSUES[issue];

const WISH_PHRASES: Record<ActWishKind, string> = {
  first: 'ganz am Anfang',
  last: 'ganz am Ende',
  firstHalf: 'erste Hälfte',
  secondHalf: 'zweite Hälfte',
  early: 'früh',
  late: 'spät',
};

export const toWishChipLabel = (kind: ActWishKind, strength: Strength): string =>
  strength === 'must' ? `Muss ${WISH_PHRASES[kind]}` : `möglichst ${WISH_PHRASES[kind]}`;

export const toWishKindLabel = (kind: ActWishKind): string => WISH_PHRASES[kind];

const STRENGTH_STATE_LABELS: Record<Strength, string> = {
  must: 'fester Wunsch',
  prefer: 'Wunsch, wenn es passt',
};

export const toStrengthStateLabel = (strength: Strength): string => STRENGTH_STATE_LABELS[strength];

export const toPaneTitle = (isNew: boolean): string => (isNew ? NEW_ACT_TITLE : 'Sessionsauftritt');

export const toShortName = (firstName: string, lastName: string): string => {
  const [initial] = lastName.trim();

  return initial === undefined ? firstName : `${firstName} ${initial}.`;
};

export const toFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`;

export const toCoEditorGrantedMessage = (name: string): string =>
  `${name} darf jetzt mitbearbeiten.`;

export const toCoEditorRevokedMessage = (name: string): string =>
  `${name} bearbeitet nicht mehr mit.`;

export const HISTORY_LABEL = 'Sessionsauftritte nach Sessions';
export const GROUP_ACTS_DENIED =
  'Die Sessionsauftritte einer Gruppe sehen ihre Mitglieder, die Gruppenleitung und die Ablaufplanung.';

export interface HistoryChip {
  label: string;
  tone: KkChipTone;
}

const PHASE_CHIPS: Record<SessionPhase, HistoryChip | null> = {
  coming: { label: 'kommt', tone: 'blue' },
  running: { label: 'läuft', tone: 'green' },
  over: null,
};

export const toPhaseChip = (phase: SessionPhase): HistoryChip | null => PHASE_CHIPS[phase];

export const toSessionSeason = (sessionYear: number): string => sessionYearsLabelOf(sessionYear);

export const toEmptySessionNote = (phase: SessionPhase): string =>
  phase === 'over' ? 'Kein Sessionsauftritt' : 'Noch kein Sessionsauftritt';

export const toHistoryActMeta = (act: GroupAct): string => {
  const cast = toCastFact(act.castSize);

  return act.kind === null ? cast : `${toActKindLabel(act.kind)}${META_SEPARATOR}${cast}`;
};

const MARK_HINTS: Record<NonNullable<HistoryActMark>, HistoryChip> = {
  mine: { label: 'du bist dabei', tone: 'accent' },
  archived: { label: 'archiviert', tone: 'neutral' },
};

export const toHistoryActHint = (mark: HistoryActMark): HistoryChip | null =>
  mark === null ? null : MARK_HINTS[mark];

export const HISTORY_LINK_LABEL = 'Alle Sessions';

export const toHistoryLinkMeta = (recorded: number, firstSessionYear: number | null): string =>
  firstSessionYear === null
    ? 'noch kein Sessionsauftritt'
    : `${countOf(recorded, 'Sessionsauftritt', 'Sessionsauftritte')} seit ${sessionYearsLabelOf(firstSessionYear)}`;
