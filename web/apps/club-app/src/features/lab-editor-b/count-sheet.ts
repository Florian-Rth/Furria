import type { CountMark } from '@/features/act-player/music-timeline';

export type SheetDensity = 'half' | 'eight' | 'two' | 'all';

export const SHEET_DENSITIES: readonly SheetDensity[] = ['half', 'eight', 'two', 'all'];

const COUNTS_PER_EIGHT = 8;
const PICKUP_TOLERANCE_SECONDS = 0.05;

export const countsPerRowOf = (density: SheetDensity): number => {
  if (density === 'half') {
    return COUNTS_PER_EIGHT / 2;
  }
  if (density === 'eight') {
    return COUNTS_PER_EIGHT;
  }

  return density === 'two' ? COUNTS_PER_EIGHT * 2 : COUNTS_PER_EIGHT * 4;
};

export interface SheetCell {
  index: number;
  column: number;
  count: number;
  eight: number;
  start: number;
  end: number;
}

export interface SheetRow {
  index: number;
  start: number;
  end: number;
  pickup: boolean;
  cells: SheetCell[];
}

interface PlacedMark {
  mark: CountMark;
  index: number;
  eight: number;
  end: number;
}

const placedMarksOf = (marks: readonly CountMark[], length: number): PlacedMark[] => {
  let eight = 0;

  return marks.map((mark, index) => {
    const previous = marks[index - 1];
    if (previous !== undefined && mark.count <= previous.count) {
      eight += 1;
    }

    return { mark, index, eight, end: marks[index + 1]?.seconds ?? length };
  });
};

const columnOf = (placed: PlacedMark, perRow: number): number => {
  const inEight = placed.mark.count - 1;

  if (perRow < COUNTS_PER_EIGHT) {
    return inEight % perRow;
  }

  const eightsPerRow = perRow / COUNTS_PER_EIGHT;

  return (placed.eight % eightsPerRow) * COUNTS_PER_EIGHT + inEight;
};

export const sheetRowsOf = (
  marks: readonly CountMark[],
  length: number,
  density: SheetDensity,
): SheetRow[] => {
  const perRow = countsPerRowOf(density);
  const rows: SheetRow[] = [];
  const first = marks[0];

  if (first === undefined) {
    return rows;
  }

  if (first.seconds > PICKUP_TOLERANCE_SECONDS) {
    rows.push({ index: 0, start: 0, end: first.seconds, pickup: true, cells: [] });
  }

  let open: SheetRow | null = null;
  let lastColumn = -1;

  for (const placed of placedMarksOf(marks, length)) {
    const column = columnOf(placed, perRow);
    if (open === null || column <= lastColumn) {
      open = {
        index: rows.length,
        start: placed.mark.seconds,
        end: placed.end,
        pickup: false,
        cells: [],
      };
      rows.push(open);
    }

    if (open !== null) {
      open.cells.push({
        index: placed.index,
        column,
        count: placed.mark.count,
        eight: placed.eight,
        start: placed.mark.seconds,
        end: placed.end,
      });
      open.end = placed.end;
    }
    lastColumn = column;
  }

  return rows;
};

export const rowIndexAt = (rows: readonly SheetRow[], seconds: number): number => {
  const index = rows.findIndex((row) => seconds >= row.start && seconds < row.end);

  if (index >= 0) {
    return index;
  }

  const last = rows.at(-1);

  return last !== undefined && seconds >= last.end ? last.index : -1;
};

export interface SheetCursor {
  row: number;
  column: number;
  cell: number | null;
}

export const cursorAt = (rows: readonly SheetRow[], seconds: number): SheetCursor | null => {
  const rowIndex = rowIndexAt(rows, seconds);
  const row = rows[rowIndex];

  if (row === undefined) {
    return null;
  }

  const cell =
    row.cells.find((candidate) => seconds >= candidate.start && seconds < candidate.end) ??
    (seconds >= row.end ? row.cells.at(-1) : undefined);

  if (cell === undefined) {
    return { row: rowIndex, column: 0, cell: null };
  }

  const span = cell.end - cell.start;
  const within = span <= 0 ? 0 : Math.min(1, Math.max(0, (seconds - cell.start) / span));

  return { row: rowIndex, column: cell.column + within, cell: cell.index };
};

export const cellWaveOf = (
  bars: readonly number[],
  length: number,
  span: { start: number; end: number },
  slots: number,
): number[] => {
  if (bars.length === 0 || length <= 0 || slots <= 0) {
    return [];
  }

  const bucketSeconds = length / bars.length;
  const slotSeconds = (span.end - span.start) / slots;

  return Array.from({ length: slots }, (_, slot) => {
    const from = Math.floor((span.start + slot * slotSeconds) / bucketSeconds);
    const to = Math.max(
      from + 1,
      Math.ceil((span.start + (slot + 1) * slotSeconds) / bucketSeconds),
    );
    let loudest = 0;
    for (const value of bars.slice(from, to)) {
      loudest = Math.max(loudest, value);
    }

    return loudest;
  });
};

export const cellIndexNear = (rows: readonly SheetRow[], seconds: number): number | null => {
  let best: number | null = null;
  let distance = Number.POSITIVE_INFINITY;

  for (const row of rows) {
    for (const cell of row.cells) {
      const gap = Math.abs(cell.start - seconds);
      if (gap < distance) {
        distance = gap;
        best = cell.index;
      }
    }
  }

  return best;
};

export type SheetStep = -1 | 1;

export const zoomedOf = (density: SheetDensity, direction: SheetStep): SheetDensity => {
  const index = SHEET_DENSITIES.indexOf(density) + direction;

  return SHEET_DENSITIES[Math.min(SHEET_DENSITIES.length - 1, Math.max(0, index))] ?? density;
};

const BACK_GRACE_SECONDS = 0.3;
const AHEAD_SECONDS = 0.01;

export const stepTargetOf = (
  starts: readonly number[],
  seconds: number,
  direction: SheetStep,
): number | null => {
  const sorted = [...starts].sort((left, right) => left - right);

  if (direction === 1) {
    return sorted.find((start) => start > seconds + AHEAD_SECONDS) ?? null;
  }

  return sorted.findLast((start) => start < seconds - BACK_GRACE_SECONDS) ?? null;
};

const COUNT_GRACE_SECONDS = 0.05;

export const countTargetOf = (
  marks: readonly CountMark[],
  seconds: number,
  direction: SheetStep,
): number | null => {
  if (direction === 1) {
    return marks.find((mark) => mark.seconds > seconds + AHEAD_SECONDS)?.seconds ?? null;
  }

  return marks.findLast((mark) => mark.seconds < seconds - COUNT_GRACE_SECONDS)?.seconds ?? null;
};

export const markIndexAt = (marks: readonly CountMark[], seconds: number): number => {
  let low = 0;
  let high = marks.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const mark = marks[middle];
    if (mark !== undefined && mark.seconds <= seconds + AHEAD_SECONDS) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
};

export const nearestMarkIndexOf = (marks: readonly CountMark[], seconds: number): number => {
  const below = markIndexAt(marks, seconds);
  const lower = marks[below];
  const upper = marks[below + 1];

  if (lower === undefined) {
    return upper === undefined ? -1 : below + 1;
  }

  return upper !== undefined && upper.seconds - seconds < seconds - lower.seconds
    ? below + 1
    : below;
};

export const eightsOfMarks = (marks: readonly CountMark[]): number[] =>
  placedMarksOf(marks, 0).map((placed) => placed.eight);

export const keyedCellsOf = (
  marks: readonly CountMark[],
  keySeconds: readonly number[],
): Set<number> =>
  new Set(keySeconds.map((seconds) => markIndexAt(marks, seconds)).filter((index) => index >= 0));

export interface KeyPoint {
  seconds: number;
  right: number;
  back: number;
}

export const movingCountIn = (
  tracks: readonly (readonly KeyPoint[])[],
  span: { start: number; end: number },
): number =>
  tracks.filter((track) =>
    track.some((point, index) => {
      const before = track[index - 1];

      return (
        before !== undefined &&
        point.seconds >= span.start &&
        point.seconds < span.end &&
        (before.right !== point.right || before.back !== point.back)
      );
    }),
  ).length;
