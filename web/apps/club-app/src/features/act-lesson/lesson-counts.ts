import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { EDGE_TOLERANCE_SECONDS } from '@/features/act-player/music-timeline';
import type { CountCell } from '@/features/act-studio/studio-timing';
import { countCellsOf } from '@/features/act-studio/studio-timing';

const NO_CELL = -1;

export interface EightPlace {
  eight: number;
  eights: number;
}

export interface StepCounts {
  cells: CountCell[];
  groups: number[][];
}

export const stepCountsOf = (
  marks: readonly CountMark[],
  range: TimelineRange | null,
): StepCounts => {
  const cells = range === null ? [] : countCellsOf(marks, range);
  const groups: number[][] = [];

  for (const cell of cells) {
    const group = groups[cell.eight];
    if (group === undefined) {
      groups[cell.eight] = [cell.count];
    } else {
      group.push(cell.count);
    }
  }

  return { cells, groups };
};

export const cellIndexAtSeconds = (cells: readonly CountCell[], seconds: number): number =>
  cells.findLastIndex((cell) => cell.start <= seconds + EDGE_TOLERANCE_SECONDS);

export const eightPlaceOf = (cells: readonly CountCell[], index: number): EightPlace | null => {
  const cell = index === NO_CELL ? undefined : cells[index];
  const last = cells.at(-1);

  return cell === undefined || last === undefined
    ? null
    : { eight: cell.eight + 1, eights: last.eight + 1 };
};
