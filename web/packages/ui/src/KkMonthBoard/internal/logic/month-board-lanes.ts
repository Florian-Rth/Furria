import type { KkMonthBoardBarData } from './month-board-types';

export interface KkPlacedBar {
  bar: KkMonthBoardBarData;
  column: number;
  span: number;
  lane: number;
  startsEarlier: boolean;
  endsLater: boolean;
}

interface WeekClip {
  bar: KkMonthBoardBarData;
  first: number;
  last: number;
  order: number;
}

const NOT_IN_WEEK = -1;

const columnOf = (weekDays: readonly string[], isoDay: string): number => {
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];

  if (first === undefined || last === undefined) {
    return NOT_IN_WEEK;
  }
  if (isoDay < first) {
    return 0;
  }
  if (isoDay > last) {
    return weekDays.length - 1;
  }

  return weekDays.indexOf(isoDay);
};

const clipToWeek = (
  weekDays: readonly string[],
  bar: KkMonthBoardBarData,
  order: number,
): WeekClip | null => {
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];

  if (first === undefined || last === undefined || bar.endDay < first || bar.startDay > last) {
    return null;
  }

  return {
    bar,
    first: columnOf(weekDays, bar.startDay),
    last: columnOf(weekDays, bar.endDay),
    order,
  };
};

const byPlacement = (left: WeekClip, right: WeekClip): number => {
  if (left.first !== right.first) {
    return left.first - right.first;
  }

  const bySpan = right.last - right.first - (left.last - left.first);

  return bySpan === 0 ? left.order - right.order : bySpan;
};

export const packWeek = (
  weekDays: readonly string[],
  bars: readonly KkMonthBoardBarData[],
): KkPlacedBar[] => {
  const clips = bars
    .map((bar, order) => clipToWeek(weekDays, bar, order))
    .filter((clip): clip is WeekClip => clip !== null)
    .sort(byPlacement);
  const laneEnds: number[] = [];

  return clips.map((clip) => {
    const free = laneEnds.findIndex((end) => end < clip.first);
    const lane = free === NOT_IN_WEEK ? laneEnds.length : free;

    laneEnds[lane] = clip.last;

    return {
      bar: clip.bar,
      column: clip.first,
      span: clip.last - clip.first + 1,
      lane,
      startsEarlier: clip.bar.startDay < (weekDays[0] ?? clip.bar.startDay),
      endsLater: clip.bar.endDay > (weekDays[weekDays.length - 1] ?? clip.bar.endDay),
    };
  });
};

export const hiddenPerDay = (
  placed: readonly KkPlacedBar[],
  dayCount: number,
  laneLimit: number,
): number[] => {
  const hidden = Array.from({ length: dayCount }, () => 0);

  for (const item of placed) {
    if (item.lane >= laneLimit) {
      for (let column = item.column; column < item.column + item.span; column += 1) {
        hidden[column] = (hidden[column] ?? 0) + 1;
      }
    }
  }

  return hidden;
};
