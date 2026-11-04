import type { SideRef } from './plan-clearance';
import type { Bounds } from './plan-geometry';
import {
  add,
  angleOf,
  boundsCenter,
  boundsOfPoints,
  distanceBetween,
  isBoundsInside,
  isPointInShape,
  normalizeDegrees,
  rotateAround,
  rotateVector,
  unionBounds,
} from './plan-geometry';
import { GROUP_ID_PREFIX, nextId, nextIds, ROW_ID_PREFIX } from './plan-ids';
import type {
  ChairOverride,
  ChairSide,
  Point,
  RectSide,
  RowSides,
  Seating,
  SeatingStandard,
  TableGroup,
  TablePlanDocument,
  TableRow,
  TableType,
} from './schemas';
import { ROW_COUNT_MAX, ROW_COUNT_MIN } from './schemas';
import type { ChairKey, RowLayout } from './table-layout';
import { clockwiseChairs, rowPitchOf, rowSpanOf } from './table-layout';

export const ALL_SIDES: RowSides = { front: true, back: true, start: true, end: true };
export const ROW_DUPLICATE_OFFSET: Point = { x: 0, y: 150 };
export const READING_LINE_TOLERANCE_CM = 100;

export interface ChairRef extends ChairKey {
  rowId: string;
}

export interface ChairPatch {
  number?: string | null;
  note?: string | null;
  removed?: boolean;
}

export interface NotePatch {
  number?: string | null;
  note?: string | null;
}

export interface Duplication {
  document: TablePlanDocument;
  ids: string[];
}

export interface Grouping {
  document: TablePlanDocument;
  groupId: string;
}

const clampCount = (count: number): number =>
  Math.min(ROW_COUNT_MAX, Math.max(ROW_COUNT_MIN, Math.round(count)));

export const normalizeText = (value: string | null): string | null => {
  const trimmed = value?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
};

export const rowIdsOf = (document: TablePlanDocument): string[] =>
  document.rows.map((row) => row.id);

export const newRowId = (document: TablePlanDocument): string =>
  nextId(ROW_ID_PREFIX, rowIdsOf(document));

export const createRow = (
  id: string,
  tableTypeId: number,
  center: Point,
  rotation = 0,
  count = 1,
): TableRow => ({
  id,
  tableTypeId,
  count: clampCount(count),
  x: center.x,
  y: center.y,
  rotation: normalizeDegrees(rotation),
  seating: null,
  groupId: null,
  sides: ALL_SIDES,
  number: null,
  note: null,
  chairs: [],
});

export const countForDrag = (length: number, type: TableType, chairDepth: number): number => {
  const pitch = rowPitchOf(type, chairDepth);
  const raw =
    type.shape === 'round'
      ? Math.round((length - type.lengthCm) / pitch) + 1
      : Math.round(length / pitch);

  return clampCount(raw);
};

export const rowFromDrag = (
  id: string,
  type: TableType,
  standard: SeatingStandard,
  from: Point,
  to: Point,
): TableRow => {
  const count = countForDrag(distanceBetween(from, to), type, standard.chairDepthCm);
  const rotation = distanceBetween(from, to) === 0 ? 0 : angleOf(from, to);
  const span = rowSpanOf(count, type, standard.chairDepthCm);
  const center = add(from, rotateVector({ x: span / 2, y: 0 }, rotation));

  return createRow(id, type.tableTypeId, center, rotation, count);
};

const mapRows = (
  document: TablePlanDocument,
  ids: readonly string[],
  change: (row: TableRow) => TableRow,
): TablePlanDocument => ({
  ...document,
  rows: document.rows.map((row) => (ids.includes(row.id) ? change(row) : row)),
});

const pruneGroups = (document: TablePlanDocument): TablePlanDocument => {
  const used = new Set(document.rows.flatMap((row) => (row.groupId === null ? [] : [row.groupId])));

  return { ...document, groups: document.groups.filter((group) => used.has(group.id)) };
};

export const findRow = (document: TablePlanDocument, rowId: string): TableRow | null =>
  document.rows.find((row) => row.id === rowId) ?? null;

export const addRow = (document: TablePlanDocument, row: TableRow): TablePlanDocument => ({
  ...document,
  rows: [...document.rows, row],
});

export const removeRows = (
  document: TablePlanDocument,
  ids: readonly string[],
): TablePlanDocument =>
  pruneGroups({ ...document, rows: document.rows.filter((row) => !ids.includes(row.id)) });

export const moveRows = (
  document: TablePlanDocument,
  ids: readonly string[],
  delta: Point,
): TablePlanDocument =>
  mapRows(document, ids, (row) => ({ ...row, x: row.x + delta.x, y: row.y + delta.y }));

export const setRowCount = (
  document: TablePlanDocument,
  rowId: string,
  count: number,
  type: TableType,
  standard: SeatingStandard,
): TablePlanDocument =>
  mapRows(document, [rowId], (row) => {
    const next = clampCount(count);
    const grown =
      (rowSpanOf(next, type, standard.chairDepthCm) -
        rowSpanOf(row.count, type, standard.chairDepthCm)) /
      2;
    const shift = rotateVector({ x: grown, y: 0 }, row.rotation);

    return { ...row, count: next, x: row.x + shift.x, y: row.y + shift.y };
  });

export const changeRowCount = (
  document: TablePlanDocument,
  rowId: string,
  delta: number,
  type: TableType,
  standard: SeatingStandard,
): TablePlanDocument => {
  const row = findRow(document, rowId);

  return row === null ? document : setRowCount(document, rowId, row.count + delta, type, standard);
};

export const setRowSide = (
  document: TablePlanDocument,
  rowId: string,
  side: RectSide,
  seated: boolean,
): TablePlanDocument =>
  mapRows(document, [rowId], (row) => ({ ...row, sides: { ...row.sides, [side]: seated } }));

const isRectSide = (side: ChairSide): side is RectSide => side !== 'around';

export const clearSides = (
  document: TablePlanDocument,
  sides: readonly SideRef[],
): TablePlanDocument =>
  sides.reduce(
    (next, ref) => (isRectSide(ref.side) ? setRowSide(next, ref.rowId, ref.side, false) : next),
    document,
  );

export const setPlanSeating = (
  document: TablePlanDocument,
  seating: Seating,
): TablePlanDocument => ({
  ...document,
  seating,
});

export const setRowSeating = (
  document: TablePlanDocument,
  rowId: string,
  seating: Seating | null,
): TablePlanDocument => mapRows(document, [rowId], (row) => ({ ...row, seating }));

export const setRowType = (
  document: TablePlanDocument,
  rowId: string,
  tableTypeId: number,
): TablePlanDocument => mapRows(document, [rowId], (row) => ({ ...row, tableTypeId, chairs: [] }));

export const setRowRotation = (
  document: TablePlanDocument,
  rowId: string,
  rotation: number,
): TablePlanDocument =>
  mapRows(document, [rowId], (row) => ({ ...row, rotation: normalizeDegrees(rotation) }));

export const rowsPivot = (document: TablePlanDocument, ids: readonly string[]): Point | null => {
  const bounds = boundsOfPoints(document.rows.filter((row) => ids.includes(row.id)));

  return bounds === null ? null : boundsCenter(bounds);
};

export const rotateRows = (
  document: TablePlanDocument,
  ids: readonly string[],
  degrees: number,
): TablePlanDocument => {
  const pivot = rowsPivot(document, ids);
  if (pivot === null) {
    return document;
  }

  return mapRows(document, ids, (row) => {
    const center = rotateAround(row, pivot, degrees);

    return { ...row, x: center.x, y: center.y, rotation: normalizeDegrees(row.rotation + degrees) };
  });
};

export const groupRows = (document: TablePlanDocument, rowIds: readonly string[]): Grouping => {
  const groupId = nextId(
    GROUP_ID_PREFIX,
    document.groups.map((group) => group.id),
  );
  const grouped = mapRows(document, rowIds, (row) => ({ ...row, groupId }));
  const withGroup = {
    ...grouped,
    groups: [...grouped.groups, { id: groupId, number: null, note: null }],
  };

  return { document: pruneGroups(withGroup), groupId };
};

export const ungroup = (document: TablePlanDocument, groupId: string): TablePlanDocument =>
  pruneGroups({
    ...document,
    rows: document.rows.map((row) => (row.groupId === groupId ? { ...row, groupId: null } : row)),
  });

export const selectionFor = (document: TablePlanDocument, rowId: string): string[] => {
  const row = findRow(document, rowId);
  if (row === null) {
    return [];
  }
  if (row.groupId === null) {
    return [row.id];
  }

  return document.rows.filter((other) => other.groupId === row.groupId).map((other) => other.id);
};

export const expandToGroups = (
  document: TablePlanDocument,
  rowIds: readonly string[],
): string[] => [...new Set(rowIds.flatMap((rowId) => selectionFor(document, rowId)))];

export const duplicateRows = (
  document: TablePlanDocument,
  ids: readonly string[],
  offset: Point = ROW_DUPLICATE_OFFSET,
): Duplication => {
  const sources = document.rows.filter((row) => ids.includes(row.id));
  const rowIds = nextIds(ROW_ID_PREFIX, rowIdsOf(document), sources.length);
  const sourceGroups = [
    ...new Set(sources.flatMap((row) => (row.groupId === null ? [] : [row.groupId]))),
  ];
  const groupIds = nextIds(
    GROUP_ID_PREFIX,
    document.groups.map((group) => group.id),
    sourceGroups.length,
  );
  const groupMap = new Map(
    sourceGroups.map((groupId, index) => [groupId, groupIds[index] ?? groupId]),
  );
  const copies = sources.map(
    (row, index): TableRow => ({
      ...row,
      id: rowIds[index] ?? row.id,
      x: row.x + offset.x,
      y: row.y + offset.y,
      groupId: row.groupId === null ? null : (groupMap.get(row.groupId) ?? null),
      number: null,
      chairs: row.chairs.map((chair) => ({ ...chair, number: null })),
    }),
  );
  const groups: TableGroup[] = sourceGroups.map((source) => {
    const original = document.groups.find((group) => group.id === source);

    return { id: groupMap.get(source) ?? source, number: null, note: original?.note ?? null };
  });

  return {
    document: {
      ...document,
      rows: [...document.rows, ...copies],
      groups: [...document.groups, ...groups],
    },
    ids: copies.map((copy) => copy.id),
  };
};

const patchText = <T extends { number: string | null; note: string | null }>(
  target: T,
  patch: NotePatch,
): T => ({
  ...target,
  number: patch.number === undefined ? target.number : normalizeText(patch.number),
  note: patch.note === undefined ? target.note : normalizeText(patch.note),
});

export const patchRow = (
  document: TablePlanDocument,
  rowId: string,
  patch: NotePatch,
): TablePlanDocument => mapRows(document, [rowId], (row) => patchText(row, patch));

export const patchGroup = (
  document: TablePlanDocument,
  groupId: string,
  patch: NotePatch,
): TablePlanDocument => ({
  ...document,
  groups: document.groups.map((group) => (group.id === groupId ? patchText(group, patch) : group)),
});

const isPlainChair = (chair: ChairOverride): boolean =>
  !chair.removed && chair.number === null && chair.note === null;

const isSameChair = (chair: ChairOverride, key: ChairKey): boolean =>
  chair.side === key.side && chair.index === key.index;

export const patchChair = (
  document: TablePlanDocument,
  ref: ChairRef,
  patch: ChairPatch,
): TablePlanDocument =>
  mapRows(document, [ref.rowId], (row) => {
    const existing = row.chairs.find((chair) => isSameChair(chair, ref)) ?? {
      side: ref.side,
      index: ref.index,
      number: null,
      note: null,
      removed: false,
    };
    const next: ChairOverride = {
      ...patchText(existing, patch),
      removed: patch.removed ?? existing.removed,
    };
    const others = row.chairs.filter((chair) => !isSameChair(chair, ref));

    return { ...row, chairs: isPlainChair(next) ? others : [...others, next] };
  });

export const readingOrder = <T extends { x: number; y: number }>(
  items: readonly T[],
  tolerance: number = READING_LINE_TOLERANCE_CM,
): T[] => {
  const byY = [...items].sort((a, b) => a.y - b.y);
  const lines: T[][] = [];
  for (const item of byY) {
    const line = lines.at(-1);
    const first = line?.[0];
    if (line === undefined || first === undefined || item.y - first.y > tolerance) {
      lines.push([item]);
    } else {
      line.push(item);
    }
  }

  return lines.flatMap((line) => [...line].sort((a, b) => a.x - b.x));
};

const numberedChairs = (row: TableRow, layout: RowLayout | undefined): ChairOverride[] => {
  if (layout === undefined) {
    return row.chairs;
  }
  const existing = new Map(row.chairs.map((chair) => [`${chair.side}:${chair.index}`, chair]));
  let next = 0;

  return clockwiseChairs(layout).flatMap((chair): ChairOverride[] => {
    const override = existing.get(`${chair.side}:${chair.index}`);
    if (chair.removed) {
      return override === undefined ? [] : [{ ...override, number: null }];
    }
    next += 1;

    return [
      {
        side: chair.side,
        index: chair.index,
        number: String(next),
        note: override?.note ?? null,
        removed: false,
      },
    ];
  });
};

export const numberPlan = (
  document: TablePlanDocument,
  layouts: readonly RowLayout[],
): TablePlanDocument => {
  const byId = new Map(layouts.map((layout) => [layout.rowId, layout]));
  const order = new Map(readingOrder(document.rows).map((row, index) => [row.id, index + 1]));

  return {
    ...document,
    rows: document.rows.map((row) => ({
      ...row,
      number: String(order.get(row.id) ?? 0),
      chairs: numberedChairs(row, byId.get(row.id)),
    })),
  };
};

export const layoutsBounds = (
  layouts: readonly RowLayout[],
  ids: readonly string[] | null = null,
): Bounds | null =>
  unionBounds(
    layouts
      .filter((layout) => ids === null || ids.includes(layout.rowId))
      .map((layout) => layout.bounds),
  );

export const hitTestRows = (layouts: readonly RowLayout[], at: Point): string | null => {
  const reversed = [...layouts].reverse();
  const onBody = reversed.find((layout) => layout.body.some((shape) => isPointInShape(at, shape)));
  if (onBody !== undefined) {
    return onBody.rowId;
  }
  const onZone = reversed.find((layout) =>
    layout.zones.some((zone) => isPointInShape(at, zone.shape)),
  );

  return onZone?.rowId ?? null;
};

export const hitTestChair = (
  layouts: readonly RowLayout[],
  at: Point,
  radius: number,
): ChairRef | null => {
  let best: { ref: ChairRef; distance: number } | null = null;
  for (const layout of layouts) {
    for (const chair of layout.chairs) {
      const distance = distanceBetween(at, chair.center);
      if (distance <= radius && (best === null || distance < best.distance)) {
        best = { ref: { rowId: layout.rowId, side: chair.side, index: chair.index }, distance };
      }
    }
  }

  return best?.ref ?? null;
};

export const rowsInBounds = (layouts: readonly RowLayout[], bounds: Bounds): string[] =>
  layouts.filter((layout) => isBoundsInside(layout.bounds, bounds)).map((layout) => layout.rowId);
