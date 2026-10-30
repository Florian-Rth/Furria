import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';

const EDGE_SECONDS = 1e-3;
const COUNTS_PER_EIGHT = 8;

export interface CountCell {
  key: string;
  index: number;
  seconds: number;
  count: number;
  eight: number;
}

export interface CountEight {
  key: string;
  number: number;
  cells: CountCell[];
}

export const countCellsOf = (
  marks: readonly CountMark[],
  range: TimelineRange | null,
): CountCell[] => {
  if (range === null) {
    return [];
  }

  return marks
    .filter(
      (mark) =>
        mark.seconds >= range.start - EDGE_SECONDS && mark.seconds < range.end - EDGE_SECONDS,
    )
    .map((mark, index) => ({
      key: String(index),
      index,
      seconds: mark.seconds,
      count: mark.count,
      eight: Math.floor(index / COUNTS_PER_EIGHT) + 1,
    }));
};

export const countEightsOf = (cells: readonly CountCell[]): CountEight[] => {
  const eights: CountEight[] = [];

  for (const cell of cells) {
    const last = eights.at(-1);
    if (last !== undefined && last.number === cell.eight) {
      last.cells.push(cell);
    } else {
      eights.push({ key: String(cell.eight), number: cell.eight, cells: [cell] });
    }
  }

  return eights;
};

export const currentCellOf = (cells: readonly CountCell[], seconds: number): number => {
  let current = -1;

  for (const [index, cell] of cells.entries()) {
    if (cell.seconds <= seconds + EDGE_SECONDS) {
      current = index;
    }
  }

  return current;
};

export const countStepOf = (
  marks: readonly CountMark[],
  seconds: number,
  direction: -1 | 1,
): number | null => {
  if (direction > 0) {
    return marks.find((mark) => mark.seconds > seconds + EDGE_SECONDS)?.seconds ?? null;
  }

  return marks.findLast((mark) => mark.seconds < seconds - EDGE_SECONDS)?.seconds ?? null;
};
