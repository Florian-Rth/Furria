export interface GridSpot {
  row: number;
  column: number;
}

const STEPS: Record<string, GridSpot> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
};

const clamp = (value: number, last: number): number => Math.min(Math.max(value, 0), last);

export const gridStepOf = (
  key: string,
  from: GridSpot,
  rows: number,
  columns: number,
): GridSpot | null => {
  if (rows === 0 || columns === 0) {
    return null;
  }
  if (key === 'Home') {
    return { row: from.row, column: 0 };
  }
  if (key === 'End') {
    return { row: from.row, column: columns - 1 };
  }
  const step = STEPS[key];
  if (step === undefined) {
    return null;
  }

  return {
    row: clamp(from.row + step.row, rows - 1),
    column: clamp(from.column + step.column, columns - 1),
  };
};

const SPOT_PATTERN = /^(\d+):(\d+)$/;

export const spotKeyOf = ({ row, column }: GridSpot): string => `${row}:${column}`;

export const spotOf = (key: string | undefined): GridSpot | null => {
  const match = SPOT_PATTERN.exec(key ?? '');
  if (match === null) {
    return null;
  }

  return { row: Number(match[1]), column: Number(match[2]) };
};
