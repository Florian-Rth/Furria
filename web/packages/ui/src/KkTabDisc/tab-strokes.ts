export type KkTabStrokeState = 'paid' | 'open' | 'overdue' | 'fresh';

export interface KkTabMark {
  index: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  crossing: boolean;
}

export interface KkTabMarkLayout {
  marks: readonly KkTabMark[];
  hidden: number;
}

const GROUP_SIZE = 5;
const STROKE_GAP = 4.4;
const STROKE_HEIGHT = 16;
const GROUP_WIDTH = STROKE_GAP * 3;
const GROUP_GAP = 8;
const GROUP_PITCH = GROUP_WIDTH + GROUP_GAP;
const ROW_PITCH = STROKE_HEIGHT + 6;
const CROSS_OVERHANG = 2.2;
const CROSS_INSET = 1.5;
const ROW_PLANS: readonly (readonly number[])[] = [[2], [2, 2], [2, 3, 2], [3, 4, 3], [3, 4, 4, 3]];
const LARGEST_PLAN: readonly number[] = [3, 4, 4, 3];
const MAX_SCALE = 2.2;
const TALLY_ROW_GROUPS = 4;

export const TAB_DISC_VIEW = 120;
export const TAB_DISC_FIELD_RADIUS = 44;
export const TAB_DISC_CAPACITY = 14 * GROUP_SIZE;
export const TAB_TALLY_CAPACITY = TALLY_ROW_GROUPS * GROUP_SIZE;
export const TAB_TALLY_WIDTH = TALLY_ROW_GROUPS * GROUP_PITCH - GROUP_GAP + CROSS_OVERHANG * 2;
export const TAB_TALLY_HEIGHT = STROKE_HEIGHT;

const sumOf = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0);

const groupMarksOf = (
  firstIndex: number,
  strokes: number,
  left: number,
  top: number,
): readonly KkTabMark[] =>
  Array.from({ length: strokes }, (_, offset) => {
    const index = firstIndex + offset;

    if (offset === GROUP_SIZE - 1) {
      return {
        index,
        x1: left - CROSS_OVERHANG,
        y1: top + STROKE_HEIGHT - CROSS_INSET,
        x2: left + GROUP_WIDTH + CROSS_OVERHANG,
        y2: top + CROSS_INSET,
        crossing: true,
      };
    }

    const x = left + offset * STROKE_GAP;

    return { index, x1: x, y1: top, x2: x, y2: top + STROKE_HEIGHT, crossing: false };
  });

const rowWidthOf = (groups: number): number => groups * GROUP_PITCH - GROUP_GAP;

const planOf = (groups: number): readonly number[] =>
  ROW_PLANS.find((plan) => sumOf(plan) >= groups) ?? LARGEST_PLAN;

const strokesInGroup = (total: number, group: number): number =>
  Math.min(GROUP_SIZE, total - group * GROUP_SIZE);

const rowsFilledOf = (plan: readonly number[], groups: number): readonly number[] =>
  plan.map((capacity, row) => Math.max(0, Math.min(capacity, groups - sumOf(plan.slice(0, row)))));

const reachOf = (mark: KkTabMark): number =>
  Math.max(Math.hypot(mark.x1, mark.y1), Math.hypot(mark.x2, mark.y2));

const placed = (mark: KkTabMark, scale: number, center: number): KkTabMark => ({
  ...mark,
  x1: center + mark.x1 * scale,
  y1: center + mark.y1 * scale,
  x2: center + mark.x2 * scale,
  y2: center + mark.y2 * scale,
});

export const tabDiscMarksOf = (count: number): KkTabMarkLayout => {
  const shown = Math.min(Math.max(count, 0), TAB_DISC_CAPACITY);
  const hidden = Math.max(count, 0) - shown;
  const groups = Math.ceil(shown / GROUP_SIZE);

  if (groups === 0) {
    return { marks: [], hidden };
  }

  const plan = planOf(groups);
  const rows = rowsFilledOf(plan, groups);
  const top = -(plan.length * ROW_PITCH - (ROW_PITCH - STROKE_HEIGHT)) / 2;
  const singleRow = plan.length === 1;
  const local = rows.flatMap((groupsInRow, row) => {
    const firstGroup = sumOf(rows.slice(0, row));
    const left = -rowWidthOf(singleRow ? groups : (plan[row] ?? groupsInRow)) / 2;

    return Array.from({ length: groupsInRow }, (_, slot) => {
      const group = firstGroup + slot;

      return groupMarksOf(
        group * GROUP_SIZE,
        strokesInGroup(shown, group),
        left + slot * GROUP_PITCH,
        top + row * ROW_PITCH,
      );
    }).flat();
  });
  const scale = Math.min(MAX_SCALE, TAB_DISC_FIELD_RADIUS / Math.max(...local.map(reachOf)));

  return { marks: local.map((mark) => placed(mark, scale, TAB_DISC_VIEW / 2)), hidden };
};

export const tabTallyMarksOf = (count: number): KkTabMarkLayout => {
  const shown = Math.min(Math.max(count, 0), TAB_TALLY_CAPACITY);
  const groups = Math.ceil(shown / GROUP_SIZE);
  const marks = Array.from({ length: groups }, (_, group) =>
    groupMarksOf(
      group * GROUP_SIZE,
      strokesInGroup(shown, group),
      CROSS_OVERHANG + group * GROUP_PITCH,
      0,
    ),
  ).flat();

  return { marks, hidden: Math.max(count, 0) - shown };
};
