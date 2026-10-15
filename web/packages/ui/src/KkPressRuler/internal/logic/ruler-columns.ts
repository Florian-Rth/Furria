import type { KkPressRulerMark, KkPressRulerMarkState } from '../../press-ruler-data';

export interface RulerColumn {
  x: number;
  marks: readonly KkPressRulerMark[];
}

const STACK_ORDER: Record<KkPressRulerMarkState, number> = {
  aligned: 0,
  struck: 1,
  shifted: 2,
};

const byStack = (left: KkPressRulerMark, right: KkPressRulerMark): number =>
  STACK_ORDER[left.state] - STACK_ORDER[right.state];

export const columnsOf = (
  marks: readonly KkPressRulerMark[],
  width: number,
  minGap: number,
): RulerColumn[] => {
  const sorted = [...marks].sort((left, right) => left.share - right.share);
  const columns: { x: number; marks: KkPressRulerMark[] }[] = [];

  for (const mark of sorted) {
    const x = mark.share * width;
    const last = columns.at(-1);

    if (last !== undefined && x - last.x < minGap) {
      last.marks.push(mark);
    } else {
      columns.push({ x, marks: [mark] });
    }
  }

  return columns.map((column) => ({ x: column.x, marks: [...column.marks].sort(byStack) }));
};

export const nearestColumnOf = (
  columns: readonly RulerColumn[],
  x: number,
  reach: number,
): RulerColumn | null => {
  let nearest: RulerColumn | null = null;

  for (const column of columns) {
    const distance = Math.abs(column.x - x);

    if (distance <= reach && (nearest === null || distance < Math.abs(nearest.x - x))) {
      nearest = column;
    }
  }

  return nearest;
};

export const steppedColumnOf = (
  columns: readonly RulerColumn[],
  current: RulerColumn | null,
  step: 1 | -1,
): RulerColumn | null => {
  if (columns.length === 0) {
    return null;
  }

  if (current === null) {
    return step === 1 ? (columns[0] ?? null) : (columns.at(-1) ?? null);
  }

  const index = columns.findIndex((column) => column.x === current.x);
  const next = Math.min(Math.max(index + step, 0), columns.length - 1);

  return columns[next] ?? null;
};
