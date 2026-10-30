import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { trainingTallyOf } from '@/features/act-training/training-copy';
import { META_SEPARATOR, toSessionLabel } from '@/features/acts/acts-copy';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { ActKind } from '@/features/running-order/schemas';
import { toStageTime } from '@/features/running-order/stage-time';
import type {
  AgendaEvening,
  AgendaItem,
  AgendaSpan,
  AgendaTemplate,
  AgendaTraining,
} from './act-agenda';
import type { GroupAgendaAct } from './group-agenda';

export const MINE_LABEL = 'Für mich';
export const DETAILS_LABEL = 'Details';
export const VIEW_SWITCH_LABEL = 'Ansicht';
export const VIEW_SWITCH_ITEMS: readonly KkSegmentSwitchItem[] = [
  {
    id: 'mine',
    label: MINE_LABEL,
    icon: 'calendar',
    count: null,
    countLabel: 'was für dich ansteht',
  },
  {
    id: 'details',
    label: DETAILS_LABEL,
    icon: 'info',
    count: null,
    countLabel: 'Studio, Wünsche, Mitbearbeitung',
  },
];
export const AGENDA_LABEL = 'Was ansteht';
export const AGENDA_EMPTY = 'In dieser Session steht nichts mehr an.';
export const YES_LABEL = 'Bin da';
export const NO_LABEL = 'Kann nicht';
export const CURRENT_MARK = 'als Nächstes';
export const OWED_MARK = 'noch nicht beantwortet';
export const OWN_SUFFIX = ' (du)';
export const PRACTICE_LABEL = 'Üben';
export const COMPOSE_LABEL = 'Musik anlegen';
export const NOTES_LINE = 'Text · kommt noch';
export const ACTS_TITLE = 'Auftritte';
export const ACTS_FAILED = 'Auftritte gerade nicht geladen.';
export const ACTS_EMPTY = 'In dieser Session gibt es noch keinen Auftritt.';
export const IN_CAST_HINT = 'dabei';
export const LEADS_HINT = 'Leitung';
export const NOTHING_AHEAD = 'nichts mehr geplant';
export const HUB_REST_LABEL = 'Alles zur Gruppe';
export const HUB_REST_META = 'Termine, Wer dabei ist, Trainingszeiten';
export const LOADING_LABEL = 'Wird geladen';
export const DETAILS_FACTS_LABEL = 'Eckdaten';
export const DETAILS_STUDIO_TITLE = 'Studio';
export const DETAILS_WISHES_TITLE = 'Wünsche an die Planung';
export const DETAILS_WISHES_EMPTY = 'keine';
export const DETAILS_LINKS_TITLE = 'Weiter';
export const EDIT_STUDIO_LABEL = 'Musik, Schritte und Videos';
export const EDIT_STUDIO_META = 'Im Studio bearbeiten';
export const EVENINGS_LINK_LABEL = 'Abende, Trainings, Einstellungen';
export const EVENINGS_LINK_META = 'Besetzung je Abend, Anwesenheit, Auftritt bearbeiten';
export const MISSING_ACT_LABEL = 'Auftritt';

const NO_MUSIC = 'Noch keine Musik';
const ASK = 'frag';
const OR = 'oder';
const NOT_PLACED = 'noch offen';

const CAST_TITLES: Record<AgendaTemplate, string> = {
  studio: 'Besetzung',
  stage: 'Auf der Bühne',
  point: 'Besetzung',
};

const WEEKDAY = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'Europe/Berlin' });
const DAY = new Intl.DateTimeFormat('de-DE', { day: '2-digit', timeZone: 'Europe/Berlin' });
const LONG_DATE = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Berlin',
});
const MONTH = new Intl.DateTimeFormat('de-DE', { month: 'long', timeZone: 'UTC' });
const CLOCK = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});
const BERLIN_YEAR = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  timeZone: 'Europe/Berlin',
});

export const castTitleOf = (template: AgendaTemplate): string => CAST_TITLES[template];

export const toWeekday = (startsAt: string): string =>
  WEEKDAY.format(new Date(startsAt)).replace('.', '');

export const toDay = (startsAt: string): string => DAY.format(new Date(startsAt));

export const toLongDate = (startsAt: string): string => LONG_DATE.format(new Date(startsAt));

export const toSpanTitle = (span: AgendaSpan, now: number): string => {
  if (span.kind === 'thisWeek') {
    return 'Diese Woche';
  }
  if (span.kind === 'nextWeek') {
    return 'Nächste Woche';
  }

  const month = MONTH.format(new Date(Date.UTC(span.year, span.month - 1, 1)));

  return String(span.year) === BERLIN_YEAR.format(new Date(now)) ? month : `${month} ${span.year}`;
};

export const toSpanMeta = (items: readonly AgendaItem[]): string => {
  const trainings = items.filter((item) => item.kind === 'training').length;
  const evenings = items.length - trainings;
  const parts = [
    trainings === 0 ? null : trainings === 1 ? '1 Training' : `${trainings} Trainings`,
    evenings === 0 ? null : evenings === 1 ? '1 Auftritt' : `${evenings} Auftritte`,
  ].filter((part): part is string => part !== null);

  return parts.join(META_SEPARATOR);
};

export const toEveningLine = (evening: AgendaEvening): string => {
  if (evening.position === null) {
    return NOT_PLACED;
  }

  const number = `Nr. ${evening.position + 1}`;

  return evening.stageStartsAt === null
    ? number
    : `${number}${META_SEPARATOR}${toStageTime(evening.position, evening.stageStartsAt)}`;
};

export const toTrainingLine = (training: AgendaTraining, showsTally: boolean): string => {
  const clock = CLOCK.format(new Date(training.startsAt));

  return showsTally ? `${clock}${META_SEPARATOR}${trainingTallyOf(training.tally)}` : clock;
};

export const toMarkLabel = (current: boolean, owed: boolean): string | null => {
  const marks = [current ? CURRENT_MARK : null, owed ? OWED_MARK : null].filter(
    (mark): mark is string => mark !== null,
  );

  return marks.length === 0 ? null : marks.join(', ');
};

export const toAnswerGroupLabel = (training: AgendaTraining): string =>
  `${training.title} am ${toLongDate(training.startsAt)}`;

const joinNames = (names: readonly string[]): string => {
  const last = names.at(-1);

  if (last === undefined) {
    return '';
  }

  return names.length === 1 ? last : `${names.slice(0, -1).join(', ')} ${OR} ${last}`;
};

export const toAskLine = (names: readonly string[]): string =>
  names.length === 0 ? NO_MUSIC : `${NO_MUSIC} — ${ASK} ${joinNames(names)}`;

export const toMoreLabel = (hidden: number): string =>
  hidden === 1 ? '1 weiterer Termin' : `${hidden} weitere Termine`;

export const toKindLabel = (kind: ActKind | null): string | null =>
  kind === null ? null : toActKindLabel(kind);

export const toActStripFacts = (
  kind: ActKind | null,
  groupName: string | null,
  sessionYear: number | null,
): string[] =>
  [toKindLabel(kind), groupName, sessionYear === null ? null : toSessionLabel(sessionYear)].filter(
    (fact): fact is string => fact !== null,
  );

export const groupActMetaOf = (entry: GroupAgendaAct): string | null => {
  const parts = [
    toKindLabel(entry.act.kind),
    entry.dimmed || entry.next !== null ? null : NOTHING_AHEAD,
  ].filter((part): part is string => part !== null);

  return parts.length === 0 ? null : parts.join(META_SEPARATOR);
};

export const groupActHintOf = (entry: GroupAgendaAct): string | null => {
  if (entry.act.viewerInCast) {
    return IN_CAST_HINT;
  }

  return entry.mine?.viewerLeads === true ? LEADS_HINT : null;
};
