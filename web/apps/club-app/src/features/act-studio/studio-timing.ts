import type { CountMark } from '@/features/act-player/music-timeline';
import type { TimeSpan } from './studio-edits';

const EDGE_TOLERANCE_SECONDS = 1e-6;

export interface CountCell {
  count: number;
  eight: number;
  start: number;
  end: number;
}

export interface CountSpan {
  first: number;
  last: number;
}

export interface CountSpanView {
  fromCount: number;
  toCount: number;
  fromEight: number;
  toEight: number;
}

export const countCellsOf = (marks: readonly CountMark[], span: TimeSpan): CountCell[] => {
  const inside = marks.filter(
    (mark) =>
      mark.seconds >= span.start - EDGE_TOLERANCE_SECONDS &&
      mark.seconds < span.end - EDGE_TOLERANCE_SECONDS,
  );
  let eight = 0;

  return inside.map((mark, index) => {
    if (index > 0 && mark.count === 1) {
      eight += 1;
    }

    return {
      count: mark.count,
      eight,
      start: mark.seconds,
      end: inside[index + 1]?.seconds ?? span.end,
    };
  });
};

export const cellIndexAt = (cells: readonly CountCell[], share: number): number =>
  Math.min(cells.length - 1, Math.max(0, Math.floor(share * cells.length)));

export const cellSpanOf = (cells: readonly CountCell[], range: TimeSpan): CountSpan | null => {
  const first = cells.findIndex((cell) => cell.end > range.start + EDGE_TOLERANCE_SECONDS);
  const last = cells.findLastIndex((cell) => cell.start < range.end - EDGE_TOLERANCE_SECONDS);

  return first < 0 || last < first ? null : { first, last };
};

export const countSpanViewOf = (
  cells: readonly CountCell[],
  span: CountSpan,
): CountSpanView | null => {
  const from = cells[span.first];
  const to = cells[span.last];

  return from === undefined || to === undefined
    ? null
    : { fromCount: from.count, toCount: to.count, fromEight: from.eight, toEight: to.eight };
};

export const eightsIn = (cells: readonly CountCell[]): number[][] => {
  const groups: number[][] = [];

  cells.forEach((cell, index) => {
    const group = groups[cell.eight];
    if (group === undefined) {
      groups[cell.eight] = [index];
    } else {
      group.push(index);
    }
  });

  return groups.filter((group) => group.length > 0);
};

export const orderedSpanOf = (from: number, to: number): CountSpan => ({
  first: Math.min(from, to),
  last: Math.max(from, to),
});

export const shareInSpan = (seconds: number, span: TimeSpan): number =>
  span.end <= span.start
    ? 0
    : Math.min(1, Math.max(0, (seconds - span.start) / (span.end - span.start)));
