import type { KkCalendarTravel } from '../../../KkCalendarStrip/calendar-strip-types';
import type {
  KkCalendarHoursAxis,
  KkCalendarHoursBlockData,
  KkCalendarHoursPlacement,
  KkCalendarHoursSpan,
  KkCalendarPlacedBlock,
} from './calendar-hours-types';

const MINUTES_PER_HOUR = 60;
const LATEST_HOUR = 30;
const MIN_SPAN_HOURS = 5;
const END_SLACK_MINUTES = 30;
const EMPTY_AXIS: KkCalendarHoursAxis = { startHour: 17, endHour: 23 };
const TICK_STEPS = [1, 2, 3, 4, 6] as const;
const HOURS_PER_DAY = 24;

export type KkCalendarHoursLabelLevel = 'full' | 'time' | 'glyph' | 'none';

export type KkCalendarHoursLabelSide = 'after' | 'before';

export interface KkCalendarHoursLabelPlan {
  level: KkCalendarHoursLabelLevel;
  side: KkCalendarHoursLabelSide;
}

export interface KkCalendarHoursLabelMetrics {
  roomPx: number;
  blockPx: number;
  glyphPx: number;
  timePx: number;
  titlePx: number;
  gapPx: number;
  padPx: number;
}

export interface KkCalendarHoursTick {
  hour: number;
  share: number;
  label: string | null;
}

const clampShare = (share: number): number => Math.min(Math.max(share, 0), 1);

const pad = (value: number): string => String(value).padStart(2, '0');

export const hoursAxisOf = (spans: readonly KkCalendarHoursSpan[]): KkCalendarHoursAxis => {
  const starts = spans.filter((span) => !span.continuesBefore).map((span) => span.startMinute);
  const ends = spans.filter((span) => !span.continuesAfter).map((span) => span.endMinute);
  const definite = [...starts, ...ends];

  if (definite.length === 0) {
    return EMPTY_AXIS;
  }

  const startHour = Math.max(0, Math.floor(Math.min(...definite) / MINUTES_PER_HOUR));
  const endHour = Math.min(
    LATEST_HOUR,
    Math.ceil((Math.max(...definite) + END_SLACK_MINUTES) / MINUTES_PER_HOUR),
  );
  if (endHour - startHour >= MIN_SPAN_HOURS) {
    return { startHour, endHour };
  }

  const grownEnd = Math.max(endHour, Math.min(HOURS_PER_DAY, startHour + MIN_SPAN_HOURS));

  return {
    startHour: Math.max(0, Math.min(startHour, grownEnd - MIN_SPAN_HOURS)),
    endHour: grownEnd,
  };
};

export const hoursShareOf = (minute: number, axis: KkCalendarHoursAxis): number => {
  const start = axis.startHour * MINUTES_PER_HOUR;
  const span = (axis.endHour - axis.startHour) * MINUTES_PER_HOUR;

  return clampShare((minute - start) / span);
};

const visibleEdges = (
  block: KkCalendarHoursBlockData,
  axis: KkCalendarHoursAxis,
): [number, number] => [
  block.continuesBefore ? 0 : hoursShareOf(block.startMinute, axis),
  block.continuesAfter ? 1 : hoursShareOf(block.endMinute, axis),
];

const byStart =
  (axis: KkCalendarHoursAxis) =>
  (left: KkCalendarHoursBlockData, right: KkCalendarHoursBlockData): number => {
    const [leftStart, leftEnd] = visibleEdges(left, axis);
    const [rightStart, rightEnd] = visibleEdges(right, axis);

    if (leftStart !== rightStart) {
      return leftStart - rightStart;
    }

    return rightEnd - leftEnd;
  };

export const placeHourBlocks = (
  blocks: readonly KkCalendarHoursBlockData[],
  axis: KkCalendarHoursAxis,
): KkCalendarHoursPlacement => {
  const rowEnds: number[] = [];
  const placed = [...blocks].sort(byStart(axis)).map((block) => {
    const [left, right] = visibleEdges(block, axis);
    const free = rowEnds.findIndex((end) => end <= left);
    const row = free === -1 ? rowEnds.length : free;

    rowEnds[row] = right;

    return { block, row, left, width: Math.max(right - left, 0) };
  });

  const withRoom = placed.map((entry): KkCalendarPlacedBlock => {
    const next = placed
      .filter((other) => other.row === entry.row && other.left > entry.left)
      .reduce((nearest, other) => Math.min(nearest, other.left), 1);

    const leadsRow = !placed.some((other) => other.row === entry.row && other.left < entry.left);

    return {
      ...entry,
      room: Math.max(next - entry.left, entry.width),
      roomBefore: leadsRow ? entry.left : 0,
    };
  });

  return { rows: Math.max(rowEnds.length, 1), blocks: withRoom };
};

export const hoursLabelLevelOf = (
  metrics: KkCalendarHoursLabelMetrics,
): KkCalendarHoursLabelLevel => {
  const lead = metrics.padPx + metrics.glyphPx + metrics.gapPx;
  const withTime = lead + metrics.timePx + metrics.gapPx;
  const withTitle = withTime + metrics.titlePx + metrics.gapPx;

  if (withTitle <= metrics.roomPx) {
    return 'full';
  }
  if (withTime <= metrics.roomPx) {
    return 'time';
  }
  if (metrics.glyphPx + metrics.padPx * 2 <= metrics.blockPx) {
    return 'glyph';
  }

  return 'none';
};

export const hoursLabelPlanOf = (
  metrics: KkCalendarHoursLabelMetrics,
  roomBeforePx: number,
): KkCalendarHoursLabelPlan => {
  const after = hoursLabelLevelOf(metrics);

  if (after === 'full') {
    return { level: after, side: 'after' };
  }

  const textPx = metrics.timePx + metrics.gapPx + metrics.titlePx + metrics.gapPx * 2;

  if (textPx <= roomBeforePx) {
    return { level: 'full', side: 'before' };
  }

  return { level: after, side: 'after' };
};

export const hourLabelOf = (hour: number): string => pad(hour % HOURS_PER_DAY);

export const hoursTicksOf = (
  axis: KkCalendarHoursAxis,
  trackPx: number,
  minLabelPx: number,
): KkCalendarHoursTick[] => {
  const hours = axis.endHour - axis.startHour;
  const pxPerHour = hours === 0 ? 0 : trackPx / hours;
  const step = TICK_STEPS.find((candidate) => candidate * pxPerHour >= minLabelPx) ?? hours;
  const ticks: KkCalendarHoursTick[] = [];

  for (let hour = axis.startHour; hour <= axis.endHour; hour += 1) {
    const labelled = step > 0 && (hour - axis.startHour) % step === 0 && hour < axis.endHour;

    ticks.push({
      hour,
      share: hours === 0 ? 0 : (hour - axis.startHour) / hours,
      label: labelled ? hourLabelOf(hour) : null,
    });
  }

  return ticks;
};

export const hoursSwipeOf = (
  offsetPx: number,
  velocityPx: number,
  thresholdPx: number,
): KkCalendarTravel => {
  const thrown = Math.abs(velocityPx) > thresholdPx * 10;
  const pulled = Math.abs(offsetPx) > thresholdPx;

  if (!pulled && !thrown) {
    return 'none';
  }

  const direction = pulled ? offsetPx : velocityPx;

  return direction < 0 ? 'later' : 'earlier';
};

const LANE_STAGGER_SECONDS = 0.07;
const AXIS_SWEEP_SECONDS = 0.28;

export const hoursGrowDelayOf = (laneIndex: number, startShare: number): number =>
  laneIndex * LANE_STAGGER_SECONDS + clampShare(startShare) * AXIS_SWEEP_SECONDS;

export const hoursMinuteOf = (moment: Date): number =>
  moment.getHours() * MINUTES_PER_HOUR + moment.getMinutes();
