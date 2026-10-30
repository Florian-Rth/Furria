import type { AttendanceTally } from '@/features/act-training/training-attendance';
import { attendanceTallyOf, castAttendanceOf } from '@/features/act-training/training-attendance';
import type { MyAct, MyActEvening, MyActTraining, Studio } from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { ActKind, CastPerson } from '@/features/running-order/schemas';

export type AgendaTemplate = 'studio' | 'stage' | 'point';

export interface AgendaTraining {
  kind: 'training';
  key: string;
  calendarEntryId: number;
  title: string;
  startsAt: string;
  answer: AttendanceAnswer | null;
  tally: AttendanceTally;
}

export interface AgendaEvening {
  kind: 'evening';
  key: string;
  eventId: number;
  title: string;
  startsAt: string;
  position: number | null;
  stageStartsAt: string | null;
}

export type AgendaItem = AgendaTraining | AgendaEvening;

export interface AgendaSource {
  template: AgendaTemplate;
  studio: Studio | null;
  cast: readonly CastPerson[];
  myAct: MyAct | null;
  viewerId: number | null;
}

export type AgendaSpan =
  | { kind: 'thisWeek' }
  | { kind: 'nextWeek' }
  | { kind: 'month'; year: number; month: number };

export interface AgendaPlacedItem {
  item: AgendaItem;
  order: number;
  current: boolean;
  sameDay: boolean;
}

export interface AgendaWeek {
  id: string;
  span: AgendaSpan;
  lead: boolean;
  entries: AgendaPlacedItem[];
}

export interface AgendaShown {
  items: AgendaItem[];
  hidden: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const STILL_RUNNING_MS = 3 * HOUR_MS;
const MONDAY_SHIFT = 3;
const WEEK_DAYS = 7;
const MIN_SHOWN = 6;
const MIN_HIDDEN = 3;

const BERLIN_DAY = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/Berlin',
});

interface CalendarDay {
  year: number;
  month: number;
  index: number;
}

const calendarDayOf = (instant: number): CalendarDay => {
  const [year = 0, month = 1, day = 1] = BERLIN_DAY.format(new Date(instant))
    .split('-')
    .map(Number);

  return { year, month, index: Math.floor(Date.UTC(year, month - 1, day) / DAY_MS) };
};

const weekOf = (day: CalendarDay): number => Math.floor((day.index + MONDAY_SHIFT) / WEEK_DAYS);

export const agendaTemplateOf = (kind: ActKind | null): AgendaTemplate => {
  if (kind === 'speech' || kind === 'music') {
    return 'stage';
  }

  return kind === 'point' ? 'point' : 'studio';
};

const fromStudio = (source: AgendaSource, studio: Studio): AgendaItem[] => {
  const evenings: AgendaItem[] = studio.evenings.flatMap((evening) =>
    evening.appearance === null
      ? []
      : [
          {
            kind: 'evening',
            key: `evening-${evening.eventId}`,
            eventId: evening.eventId,
            title: evening.title,
            startsAt: evening.startsAt,
            position: evening.appearance.position,
            stageStartsAt: evening.appearance.stageStartsAt,
          },
        ],
  );
  const trainings: AgendaItem[] =
    source.template === 'studio'
      ? studio.trainings.map((training) => ({
          kind: 'training',
          key: `training-${training.calendarEntryId}`,
          calendarEntryId: training.calendarEntryId,
          title: training.title,
          startsAt: training.startsAt,
          answer:
            training.responses.find((response) => response.personId === source.viewerId)?.answer ??
            null,
          tally: attendanceTallyOf(castAttendanceOf(source.cast, training)),
        }))
      : [];

  return [...evenings, ...trainings];
};

export const agendaEveningOf = (evening: MyActEvening): AgendaEvening => ({
  kind: 'evening',
  key: `evening-${evening.eventId}`,
  eventId: evening.eventId,
  title: evening.title,
  startsAt: evening.startsAt,
  position: evening.position,
  stageStartsAt: evening.stageStartsAt,
});

export const agendaTrainingOf = (training: MyActTraining, castSize: number): AgendaTraining => ({
  kind: 'training',
  key: `training-${training.calendarEntryId}`,
  calendarEntryId: training.calendarEntryId,
  title: training.title,
  startsAt: training.startsAt,
  answer: training.viewerAnswer,
  tally: { present: Math.max(castSize - training.absent, 0), expected: castSize },
});

const fromMyAct = (template: AgendaTemplate, act: MyAct): AgendaItem[] => {
  const evening = act.nextEvening === null ? [] : [agendaEveningOf(act.nextEvening)];
  const training =
    template !== 'studio' || act.nextTraining === null
      ? []
      : [agendaTrainingOf(act.nextTraining, act.cast.length)];

  return [...evening, ...training];
};

const isAhead = (item: AgendaItem, now: number): boolean =>
  Date.parse(item.startsAt) + STILL_RUNNING_MS >= now;

const byStart = (first: AgendaItem, second: AgendaItem): number =>
  Date.parse(first.startsAt) - Date.parse(second.startsAt);

export const agendaItemsOf = (source: AgendaSource, now: number): AgendaItem[] => {
  const items =
    source.studio !== null
      ? fromStudio(source, source.studio)
      : source.myAct === null
        ? []
        : fromMyAct(source.template, source.myAct);

  return items.filter((item) => isAhead(item, now)).sort(byStart);
};

export const nextAgendaItemOf = (
  template: AgendaTemplate,
  act: MyAct,
  now: number,
): AgendaItem | null =>
  fromMyAct(template, act)
    .filter((item) => isAhead(item, now))
    .sort(byStart)[0] ?? null;

export const shownAgendaOf = (
  items: readonly AgendaItem[],
  now: number,
  expanded: boolean,
): AgendaShown => {
  const nearWeekEnd = weekOf(calendarDayOf(now)) + 1;
  const near = items.filter(
    (item) => weekOf(calendarDayOf(Date.parse(item.startsAt))) <= nearWeekEnd,
  ).length;
  const shownCount = Math.max(near, MIN_SHOWN);
  const hidden = items.length - shownCount;

  if (expanded || hidden < MIN_HIDDEN) {
    return { items: [...items], hidden: 0 };
  }

  return { items: items.slice(0, shownCount), hidden };
};

const spanOf = (startsAt: string, now: number): AgendaSpan => {
  const day = calendarDayOf(Date.parse(startsAt));
  const weeksAhead = weekOf(day) - weekOf(calendarDayOf(now));

  if (weeksAhead <= 0) {
    return { kind: 'thisWeek' };
  }
  if (weeksAhead === 1) {
    return { kind: 'nextWeek' };
  }

  return { kind: 'month', year: day.year, month: day.month };
};

const spanIdOf = (span: AgendaSpan): string =>
  span.kind === 'month' ? `${span.year}-${span.month}` : span.kind;

export const agendaWeeksOf = (items: readonly AgendaItem[], now: number): AgendaWeek[] => {
  const weeks: AgendaWeek[] = [];

  items.forEach((item, order) => {
    const span = spanOf(item.startsAt, now);
    const id = spanIdOf(span);
    const previous = items[order - 1];
    const sameDay =
      previous !== undefined &&
      calendarDayOf(Date.parse(previous.startsAt)).index ===
        calendarDayOf(Date.parse(item.startsAt)).index;
    const entry: AgendaPlacedItem = { item, order, current: order === 0, sameDay };
    const last = weeks.at(-1);

    if (last !== undefined && last.id === id) {
      last.entries.push(entry);
    } else {
      weeks.push({ id, span, lead: weeks.length === 0, entries: [entry] });
    }
  });

  return weeks;
};

export const isOwedTraining = (item: AgendaItem, answers: boolean): boolean =>
  answers && item.kind === 'training' && item.answer === null;

export type PracticeBar =
  | { kind: 'none' }
  | { kind: 'play' }
  | { kind: 'compose' }
  | { kind: 'ask'; names: string[] };

export interface PracticeBarInput {
  template: AgendaTemplate;
  playable: boolean;
  canEditStudio: boolean;
  askable: readonly string[];
}

export const practiceBarOf = ({
  template,
  playable,
  canEditStudio,
  askable,
}: PracticeBarInput): PracticeBar => {
  if (template !== 'studio') {
    return { kind: 'none' };
  }
  if (playable) {
    return { kind: 'play' };
  }

  return canEditStudio ? { kind: 'compose' } : { kind: 'ask', names: [...askable] };
};

interface NamedPerson {
  personId: number;
  firstName: string;
}

export const askableNamesOf = (
  editors: readonly NamedPerson[],
  viewerId: number | null,
): string[] =>
  editors.filter((editor) => editor.personId !== viewerId).map((editor) => editor.firstName);
