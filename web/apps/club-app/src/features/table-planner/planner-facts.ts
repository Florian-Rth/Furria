import type {
  RectSide,
  Seating,
  TableRow,
  TableShape,
  TableType,
} from '@/features/hall-plan/schemas';
import { RECT_SIDES, SEATINGS, TABLE_SHAPES } from '@/features/hall-plan/schemas';
import type { PlanCounts, RowLayout } from '@/features/hall-plan/table-layout';

export const countsOfRows = (
  layouts: readonly RowLayout[],
  rowIds: readonly string[],
): PlanCounts =>
  layouts
    .filter((layout) => rowIds.includes(layout.rowId))
    .reduce<PlanCounts>(
      (counts, layout) => ({
        tables: counts.tables + layout.tableCount,
        chairs: counts.chairs + layout.chairCount,
      }),
      { tables: 0, chairs: 0 },
    );

export interface SideToggle {
  side: RectSide;
  seated: boolean;
  available: boolean;
}

export const sideTogglesOf = (row: TableRow, type: TableType): SideToggle[] =>
  RECT_SIDES.map((side) => {
    const isEnd = side === 'start' || side === 'end';
    const available = !isEnd || type.seatsAtEnds;

    return { side, seated: available && row.sides[side], available };
  });

export const isSeating = (value: string): value is Seating =>
  SEATINGS.some((seating) => seating === value);

export const isTableShape = (value: string): value is TableShape =>
  TABLE_SHAPES.some((shape) => shape === value);
