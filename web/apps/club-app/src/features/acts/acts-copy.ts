import type { KkIconName } from '@furria/ui/KkIcon';
import type { ActKind, ActWishKind, Strength } from '@/features/running-order/schemas';
import type { CastTally, CastTileState } from './act-cast';
import type { NameIssue } from './act-editor';
import type { ActsFilter } from './schemas';

export const ACTS_TITLE = 'Auftritte';
export const GROUP_ACTS_TITLE = 'Unsere Auftritte';
export const NEW_ACT_LABEL = 'Neuer Auftritt';
export const NEW_ACT_TITLE = 'Neuer Auftritt';
export const SEARCH_PLACEHOLDER = 'Auftritt, Gruppe oder Person';
export const LOADING_LABEL = 'Auftritte werden geladen';
export const RETRY_LABEL = 'Erneut laden';
export const LIST_LABEL = 'Auftritte nach Gruppen';
export const POINTS_TITLE = 'Ablaufpunkte';
export const POINT_CONTEXT = 'Ablaufpunkt';
export const OPEN_LABEL = 'Bearbeiten';
export const CLOSE_LABEL = 'Schließen';
export const NONE = 'keine';
export const EMPTY_FILTER_NOTE = 'Hier gibt es keine Auftritte.';
export const HEALTH_LABEL = 'Überblick der Auftritte';
export const FILTER_LABEL = 'Auftritte filtern';
export const SHARED_TITLE = 'Gemeinsame Leute';
export const CARRIERS_LABEL = 'Mehrfach dabei';
export const SPOTLIGHT_PRESS_LABEL = 'Auftritte hervorheben von';
export const SPOTLIGHT_CLEAR_LABEL = 'Aufheben';
export const NAME_LABEL = 'Name des Auftritts';
export const NAME_PLACEHOLDER = 'Name des Auftritts';
export const KIND_CHOICE_LABEL = 'Art des Auftritts';
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
export const SHARED_ACTS_LABEL = 'Auftritte mit gemeinsamen Leuten';
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

const count = (value: number, one: string, many: string): string =>
  `${value} ${value === 1 ? one : many}`;

export const toSectionMeta = (total: number): string => count(total, 'Auftritt', 'Auftritte');

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
  `${carriers} von ${people} Leuten stehen in mehreren Auftritten`;

export const toCarriersLegend = (carriers: number): string => `${carriers} mehrfach`;

export const toSinglesLegend = (singles: number): string => `${singles} nur einmal`;

export const toSpotlightLine = (name: string, acts: number): string =>
  `${name} steht in ${count(acts, 'Auftritt', 'Auftritten')}`;

export const toSharedActMeta = (shared: number): string =>
  `${shared} ${shared === 1 ? 'Person' : 'Leute'} gemeinsam`;

export const toCastTallyLine = (tally: CastTally, grouped: boolean): string => {
  if (!grouped) {
    return tally.present === 0 ? 'Niemand eingetragen' : `${tally.present} dabei`;
  }

  const parts = [
    `${tally.present} dabei`,
    tally.out === 0 ? null : `${tally.out} nicht dabei`,
    tally.guests === 0 ? null : count(tally.guests, 'Gast', 'Gäste'),
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
  missing: 'Der Auftritt braucht einen Namen.',
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

export const toPaneTitle = (isNew: boolean): string => (isNew ? NEW_ACT_TITLE : 'Auftritt');

export const toShortName = (firstName: string, lastName: string): string => {
  const [initial] = lastName.trim();

  return initial === undefined ? firstName : `${firstName} ${initial}.`;
};

export const toFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`;
