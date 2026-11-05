import { add, rotateVector } from './plan-geometry';
import { GROUP_ID_PREFIX, nextId, nextIds, ROW_ID_PREFIX } from './plan-ids';
import type {
  Point,
  Seating,
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from './schemas';
import { ROW_COUNT_MAX, ROW_COUNT_MIN } from './schemas';
import { layoutRow, rowSpanOf } from './table-layout';
import { createRow } from './table-plan-ops';

export const SEAT_REQUEST_SHAPES = ['row', 'block'] as const;
export type SeatRequestShape = (typeof SEAT_REQUEST_SHAPES)[number];

export const SEATS_MIN = 1;
export const SEATS_MAX = 2000;
export const DEFAULT_TABLES_PER_ROW = 6;

export interface SeatRequest {
  seats: number;
  shape: SeatRequestShape;
  tablesPerRow: number;
  type: TableType;
  seating: Seating;
}

export interface SeatOffer {
  rows: TableRow[];
  groupId: string | null;
  tables: number;
  chairs: number;
  enough: boolean;
}

const PROBE_ID = 'probe';

const clampWhole = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Math.round(value), min), max);

export const chairsForTables = (
  count: number,
  type: TableType,
  standard: SeatingStandard,
  seating: Seating,
): number =>
  layoutRow(
    createRow(PROBE_ID, type.tableTypeId, { x: 0, y: 0 }, 0, count),
    type,
    standard,
    seating,
  ).chairCount;

export const tablesForSeats = (
  seats: number,
  type: TableType,
  standard: SeatingStandard,
  seating: Seating,
  most: number = ROW_COUNT_MAX,
): number => {
  for (let count = ROW_COUNT_MIN; count <= most; count += 1) {
    if (chairsForTables(count, type, standard, seating) >= seats) {
      return count;
    }
  }

  return most;
};

const rowDepthOf = (type: TableType): number =>
  type.shape === 'round' ? type.lengthCm : type.widthCm;

export const blockRowPitch = (type: TableType, standard: SeatingStandard): number =>
  rowDepthOf(type) + 2 * standard.chairDepthCm + standard.aisleWidthCm;

export const blockRowCounts = (request: SeatRequest, standard: SeatingStandard): number[] => {
  const perRow = clampWhole(request.tablesPerRow, ROW_COUNT_MIN, ROW_COUNT_MAX);
  const fullRowChairs = chairsForTables(perRow, request.type, standard, request.seating);
  if (fullRowChairs <= 0) {
    return [perRow];
  }
  const fullRows = Math.floor(request.seats / fullRowChairs);
  const rest = request.seats - fullRows * fullRowChairs;
  const lastRow =
    rest <= 0 ? [] : [tablesForSeats(rest, request.type, standard, request.seating, perRow)];

  return [...Array.from({ length: fullRows }, () => perRow), ...lastRow];
};

const rowCountsOf = (request: SeatRequest, standard: SeatingStandard): number[] =>
  request.shape === 'row'
    ? [tablesForSeats(request.seats, request.type, standard, request.seating)]
    : blockRowCounts(request, standard);

export const seatOfferOf = (
  document: TablePlanDocument,
  request: SeatRequest,
  standard: SeatingStandard,
  center: Point,
  rotation = 0,
): SeatOffer => {
  const counts = rowCountsOf(request, standard);
  const ids = nextIds(
    ROW_ID_PREFIX,
    document.rows.map((row) => row.id),
    counts.length,
  );
  const groupId =
    counts.length > 1
      ? nextId(
          GROUP_ID_PREFIX,
          document.groups.map((group) => group.id),
        )
      : null;
  const pitch = blockRowPitch(request.type, standard);
  const longest = Math.max(
    ...counts.map((count) => rowSpanOf(count, request.type, standard.chairDepthCm)),
  );
  const firstY = -((counts.length - 1) * pitch) / 2;
  const rows = counts.map((count, index) => {
    const span = rowSpanOf(count, request.type, standard.chairDepthCm);
    const local = { x: (span - longest) / 2, y: firstY + index * pitch };
    const row = createRow(
      ids[index] ?? `${ROW_ID_PREFIX}${index}`,
      request.type.tableTypeId,
      add(center, rotateVector(local, rotation)),
      rotation,
      count,
    );

    return { ...row, groupId };
  });
  const chairs = counts.reduce(
    (sum, count) => sum + chairsForTables(count, request.type, standard, request.seating),
    0,
  );

  return {
    rows,
    groupId,
    tables: counts.reduce((sum, count) => sum + count, 0),
    chairs,
    enough: chairs >= request.seats,
  };
};

export const withSeatOffer = (
  document: TablePlanDocument,
  offer: SeatOffer,
): TablePlanDocument => ({
  ...document,
  rows: [...document.rows, ...offer.rows],
  groups:
    offer.groupId === null
      ? document.groups
      : [...document.groups, { id: offer.groupId, number: null, note: null }],
});
