import type { KkCalendarDayData } from '@furria/ui/calendar-strip-types';
import type { KkCalendarLineGroup } from '@furria/ui/KkCalendarAgendaLine';
import type { KkCalendarTimeTone } from '@furria/ui/KkCalendarAgendaTime';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toLocalIsoDay, toTimeLabel, toTimeSpanLabel } from '@/lib/calendar-days';
import { formatPriceCents, toDoorsOpenLabel, toEventStatusLabel } from '@/lib/event-copy';
import type { EventCover } from '@/lib/event-cover';
import { toEventCover } from '@/lib/event-cover';
import type {
  CalendarDayCell,
  CalendarDayItem,
  CalendarDayTone,
  CalendarLine,
  CalendarMark,
  CalendarSection,
} from './calendar-agenda';
import {
  dayToneOf,
  groupTagsOf,
  isPastLine,
  markOf,
  relativeDayOf,
  sectionItemsOf,
  shiftDay,
  toCalendarTime,
  weekNameOf,
} from './calendar-agenda';
import type { CalendarTimeCopy } from './calendar-agenda-copy';
import {
  KIND_GLYPHS,
  LANDMARK_LABELS,
  NO_ENTRIES_NOTE,
  RUNNING_LABEL,
  toDayCellSpoken,
  toDayHeadDate,
  toDayLongLabel,
  toGapLabel,
  toGroupName,
  toLineSpoken,
  toRelativeLabel,
  toTimeCopy,
  toUsualSpoken,
  toWeekTitle,
  USUAL_PLAN_LABEL,
  USUAL_TITLE,
  VISIBILITY_LABELS,
  weekdayOf,
} from './calendar-agenda-copy';
import type { CalendarEntry, UsualTraining } from './schemas';

const THUMB_SIZES = '72px';
const COVER_SIZES = '(min-width: 1200px) 30rem, 100vw';
const FACT_SEPARATOR = ' · ';

type CalendarDayEntryItem = Extract<CalendarDayItem, { kind: 'day' }>;

export interface CalendarDayHeadView {
  date: string;
  relative: string;
  tone: CalendarDayTone;
  landmark: string | null;
  carnival: boolean;
  note: string | null;
  spoken: string;
}

export const toDayHeadView = (
  item: CalendarDayEntryItem,
  todayDay: string,
): CalendarDayHeadView => {
  const relative = relativeDayOf(item.isoDay, todayDay);

  return {
    date: toDayHeadDate(item.isoDay),
    relative: toRelativeLabel(relative),
    tone: dayToneOf(relative),
    landmark: item.landmark === null ? null : LANDMARK_LABELS[item.landmark],
    carnival: item.carnival,
    note: item.lines.length === 0 ? NO_ENTRIES_NOTE : null,
    spoken: toDayLongLabel(item.isoDay),
  };
};

const toLineGroups = (entry: CalendarEntry): KkCalendarLineGroup[] =>
  groupTagsOf(entry).map((tag) => ({ key: tag.key, name: toGroupName(tag.name), mark: tag.mark }));

const thumbOf = (entry: CalendarEntry, sizes: string): EventCover | null =>
  entry.event === null
    ? null
    : toEventCover(
        {
          eventId: entry.calendarEntryId,
          picture: entry.event.picture,
          isCancelled: entry.event.status === 'cancelled',
        },
        sizes,
      );

export interface CalendarLineView {
  glyph: (typeof KIND_GLYPHS)[keyof typeof KIND_GLYPHS];
  title: string;
  venue: string | null;
  groups: KkCalendarLineGroup[];
  liveLabel: string | null;
  mark: CalendarMark;
  quiet: boolean;
  time: CalendarTimeCopy;
  timeTone: KkCalendarTimeTone;
  spoken: string;
  thumb: EventCover | null;
}

export const toLineView = (line: CalendarLine, nowMs: number): CalendarLineView => {
  const { entry } = line;
  const live = entry.isRunning;
  const quiet = !live && (line.dayIndex > 0 || isPastLine(line, nowMs));
  const time = toTimeCopy(toCalendarTime(line));
  const kindLabel = CALENDAR_KIND_LABELS[entry.kind];

  return {
    glyph: KIND_GLYPHS[entry.kind],
    title: entry.title,
    venue: entry.venueName,
    groups: toLineGroups(entry),
    liveLabel: live ? RUNNING_LABEL : null,
    mark: markOf(entry.ownerGroupId, entry.ownerGroupTone),
    quiet,
    time,
    timeTone: live ? 'live' : quiet ? 'quiet' : 'ink',
    spoken: toLineSpoken(entry.title, kindLabel, time.spoken, entry.venueName),
    thumb: thumbOf(entry, THUMB_SIZES),
  };
};

export const toDayData = (cell: CalendarDayCell, activeDay: string | null): KkCalendarDayData => ({
  isoDay: cell.isoDay,
  dayNumber: cell.dayNumber,
  weekday: weekdayOf(cell.isoDay),
  label: toDayCellSpoken(cell.isoDay, cell.count, cell.owed, cell.usualMarks.length),
  isToday: cell.isToday,
  isPast: cell.isPast,
  inMonth: cell.inMonth,
  selected: cell.isoDay === activeDay,
  marks: cell.marks,
  usualMarks: cell.usualMarks,
  owed: cell.owed,
  landmark: cell.landmark !== null,
  carnival: cell.carnival,
});

export interface CalendarDetailView {
  glyph: CalendarLineView['glyph'];
  kindLabel: string;
  title: string;
  when: string;
  liveLabel: string | null;
  mark: CalendarMark;
  venue: string | null;
  groups: KkCalendarLineGroup[];
  visibility: string;
  text: string | null;
  eventLine: string | null;
  cover: EventCover | null;
}

const trimmed = (value: string | null): string | null => {
  const text = value?.trim() ?? '';

  return text === '' ? null : text;
};

const eventLineOf = (entry: CalendarEntry): string | null => {
  if (entry.event === null) {
    return null;
  }

  const parts = [toEventStatusLabel(entry.event)];

  if (entry.event.doorsOpenAt !== null) {
    parts.push(toDoorsOpenLabel(entry.event.doorsOpenAt));
  }
  if (entry.event.priceCents !== null) {
    parts.push(formatPriceCents(entry.event.priceCents));
  }
  if (entry.event.ageHint !== null) {
    parts.push(entry.event.ageHint);
  }

  return parts.join(FACT_SEPARATOR);
};

const textOf = (entry: CalendarEntry): string | null => {
  const teaser = trimmed(entry.event?.teaser ?? null);
  const description = trimmed(entry.description);

  if (teaser !== null && description !== null) {
    return `${teaser}\n\n${description}`;
  }

  return teaser ?? description;
};

export const toDetailView = (entry: CalendarEntry): CalendarDetailView => ({
  glyph: KIND_GLYPHS[entry.kind],
  kindLabel: CALENDAR_KIND_LABELS[entry.kind],
  title: entry.title,
  when: `${toDayLongLabel(toLocalIsoDay(entry.startsAt))}${FACT_SEPARATOR}${toTimeSpanLabel(entry.startsAt, entry.endsAt)}`,
  liveLabel: entry.isRunning ? RUNNING_LABEL : null,
  mark: markOf(entry.ownerGroupId, entry.ownerGroupTone),
  venue: entry.venueName,
  groups: toLineGroups(entry),
  visibility: VISIBILITY_LABELS[entry.visibility],
  text: textOf(entry),
  eventLine: eventLineOf(entry),
  cover: thumbOf(entry, COVER_SIZES),
});

export const lineOrdersOf = (sections: readonly CalendarSection[]): Map<string, number> => {
  const orders = new Map<string, number>();

  for (const item of sectionItemsOf(sections)) {
    if (item.kind === 'day') {
      for (const line of item.lines) {
        orders.set(line.key, orders.size);
      }
    }
  }

  return orders;
};

export const toSectionTitle = (section: CalendarSection, todayDay: string): string =>
  toWeekTitle(weekNameOf(section.monday, todayDay), section.monday);

export interface CalendarGapView {
  label: string;
  days: string[];
}

export const toGapView = (item: Extract<CalendarDayItem, { kind: 'gap' }>): CalendarGapView => {
  const days: string[] = [];

  for (let isoDay = item.fromDay; isoDay <= item.toDay; isoDay = shiftDay(isoDay, 1)) {
    days.push(isoDay);
  }

  return { label: toGapLabel(item.fromDay, item.toDay), days };
};

export const hasLines = (sections: readonly CalendarSection[]): boolean =>
  sectionItemsOf(sections).some((item) => item.kind === 'day' && item.lines.length > 0);

export interface CalendarUsualView {
  time: string;
  until: string;
  title: string;
  groupName: string;
  mark: CalendarMark;
  venue: string | null;
  spoken: string;
  actionLabel: string | undefined;
}

export const toUsualView = (usual: UsualTraining, mayPlan: boolean): CalendarUsualView => {
  const time = toTimeLabel(usual.startsAt);
  const until = toTimeLabel(usual.endsAt);

  return {
    time,
    until,
    title: USUAL_TITLE,
    groupName: usual.groupName,
    mark: markOf(usual.groupId, usual.groupTone),
    venue: usual.venueName,
    spoken: toUsualSpoken(usual.groupName, time, until, usual.venueName, mayPlan),
    actionLabel: mayPlan ? USUAL_PLAN_LABEL : undefined,
  };
};
