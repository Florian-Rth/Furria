import type { Blocker } from './plan-blockers';
import type { Bounds, OrientedRect, Shape } from './plan-geometry';
import {
  add,
  boundsOfShape,
  rectShape,
  rotateVector,
  scale,
  toWorld,
  unionBounds,
} from './plan-geometry';
import type { Footprint } from './plan-overlap';
import { footprintOf, isClearlyOverlapping } from './plan-overlap';
import type {
  ChairOverride,
  ChairSide,
  Point,
  RectSide,
  Seating,
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from './schemas';

export interface ChairKey {
  side: ChairSide;
  index: number;
}

export interface ChairRef extends ChairKey {
  rowId: string;
}

export type ChairState = 'seated' | 'leftOut' | 'removed';

export interface PlacedChair {
  side: ChairSide;
  index: number;
  center: Point;
  rotation: number;
  slotWidth: number;
  cellRect: OrientedRect;
  cell: Footprint;
  state: ChairState;
  kept: boolean;
  number: string | null;
  note: string | null;
}

export interface PlacedTable {
  index: number;
  shape: Shape;
  rect: OrientedRect | null;
  center: Point;
  radius: number | null;
}

export interface RowLayout {
  rowId: string;
  groupId: string | null;
  shape: TableType['shape'];
  center: Point;
  rotation: number;
  body: Shape[];
  tables: PlacedTable[];
  chairs: PlacedChair[];
  tableCount: number;
  chairCount: number;
  bounds: Bounds;
}

export interface PlanCounts {
  tables: number;
  chairs: number;
}

interface ChairGeometry {
  spacing: number;
  depth: number;
}

const FULL_TURN = 360;
const QUARTER_TURN = 90;
const HALF_TURN = 180;
const OUTWARD: Point = { x: 0, y: -1 };

export const tableTypesById = (types: readonly TableType[]): Map<number, TableType> =>
  new Map(types.map((type) => [type.tableTypeId, type]));

export const effectiveSeating = (row: TableRow, planSeating: Seating): Seating =>
  row.seating ?? planSeating;

export const spacingOf = (standard: SeatingStandard, seating: Seating): number =>
  seating === 'comfortable' ? standard.comfortableChairSpacingCm : standard.maximumChairSpacingCm;

export const chairsAlong = (length: number, spacing: number): number =>
  spacing <= 0 ? 0 : Math.floor(length / spacing);

export const roundChairsPerTable = (
  diameter: number,
  chairDepth: number,
  spacing: number,
): number => chairsAlong(Math.PI * (diameter + chairDepth), spacing);

export const rowLengthOf = (row: Pick<TableRow, 'count'>, type: TableType): number =>
  row.count * type.lengthCm;

export const roundPitchOf = (type: TableType, chairDepth: number): number =>
  type.lengthCm + 2 * chairDepth;

export const rowPitchOf = (type: TableType, chairDepth: number): number =>
  type.shape === 'round' ? roundPitchOf(type, chairDepth) : type.lengthCm;

export const rowSpanOf = (count: number, type: TableType, chairDepth: number): number =>
  type.shape === 'round'
    ? (count - 1) * roundPitchOf(type, chairDepth) + type.lengthCm
    : count * type.lengthCm;

export const isSideSeated = (row: TableRow, type: TableType, side: RectSide): boolean =>
  side === 'start' || side === 'end' ? row.sides[side] && type.seatsAtEnds : row.sides[side];

export const slotsOnSide = (
  row: TableRow,
  type: TableType,
  side: RectSide,
  spacing: number,
): number => {
  if (!isSideSeated(row, type, side)) {
    return 0;
  }

  return side === 'start' || side === 'end'
    ? chairsAlong(type.widthCm, spacing)
    : chairsAlong(rowLengthOf(row, type), spacing);
};

const chairKeyOf = (key: ChairKey): string => `${key.side}:${key.index}`;

const overridesByKey = (chairs: readonly ChairOverride[]): Map<string, ChairOverride> =>
  new Map(chairs.map((chair) => [chairKeyOf(chair), chair]));

export const outwardOf = (chair: Pick<PlacedChair, 'rotation'>): Point =>
  rotateVector(OUTWARD, chair.rotation);

export const chairCellRect = (
  center: Point,
  rotation: number,
  geometry: ChairGeometry,
): OrientedRect => ({
  center,
  width: geometry.spacing,
  height: geometry.depth,
  rotation,
});

export const aisleRectOf = (chair: PlacedChair, aisle: number): OrientedRect => ({
  center: add(chair.center, scale(outwardOf(chair), (chair.cellRect.height + aisle) / 2)),
  width: chair.cellRect.width,
  height: aisle,
  rotation: chair.rotation,
});

const placeChair = (
  row: TableRow,
  overrides: Map<string, ChairOverride>,
  key: ChairKey,
  local: { at: Point; rotation: number; slotWidth: number },
  geometry: ChairGeometry,
): PlacedChair => {
  const override = overrides.get(chairKeyOf(key));
  const center = toWorld(local.at, row, row.rotation);
  const rotation = (((row.rotation + local.rotation) % FULL_TURN) + FULL_TURN) % FULL_TURN;
  const cellRect = chairCellRect(center, rotation, geometry);

  return {
    side: key.side,
    index: key.index,
    center,
    rotation,
    slotWidth: local.slotWidth,
    cellRect,
    cell: footprintOf(rectShape(cellRect)),
    state: override?.removed === true ? 'removed' : 'seated',
    kept: override?.kept ?? false,
    number: override?.number ?? null,
    note: override?.note ?? null,
  };
};

const evenly = (count: number, length: number): number[] =>
  Array.from({ length: count }, (_, index) => -length / 2 + ((index + 0.5) * length) / count);

type RowParts = Pick<RowLayout, 'shape' | 'body' | 'tables' | 'chairs'>;

const SIDE_ROTATION: Record<RectSide, number> = {
  front: 0,
  back: HALF_TURN,
  start: -QUARTER_TURN,
  end: QUARTER_TURN,
};

const rectRowLayout = (
  row: TableRow,
  type: TableType,
  geometry: ChairGeometry,
  standard: SeatingStandard,
): RowParts => {
  const length = rowLengthOf(row, type);
  const width = type.widthCm;
  const overrides = overridesByKey(row.chairs);
  const worldRect = (center: Point, rectWidth: number, rectHeight: number): OrientedRect => ({
    center: toWorld(center, row, row.rotation),
    width: rectWidth,
    height: rectHeight,
    rotation: row.rotation,
  });
  const tables = Array.from({ length: row.count }, (_, index): PlacedTable => {
    const rect = worldRect(
      { x: -length / 2 + (index + 0.5) * type.lengthCm, y: 0 },
      type.lengthCm,
      width,
    );

    return { index, shape: rectShape(rect), rect, center: rect.center, radius: null };
  });
  const sideOffset = (width + standard.chairDepthCm) / 2;
  const endOffset = (length + standard.chairDepthCm) / 2;
  const localOf = (side: RectSide, offset: number): Point => {
    switch (side) {
      case 'front':
        return { x: offset, y: -sideOffset };
      case 'back':
        return { x: offset, y: sideOffset };
      case 'start':
        return { x: -endOffset, y: offset };
      default:
        return { x: endOffset, y: offset };
    }
  };
  const sides: readonly RectSide[] = ['front', 'back', 'start', 'end'];
  const chairs = sides.flatMap((side) => {
    const count = slotsOnSide(row, type, side, geometry.spacing);
    const along = side === 'front' || side === 'back' ? length : width;

    return evenly(count, along).map((offset, index) =>
      placeChair(
        row,
        overrides,
        { side, index },
        { at: localOf(side, offset), rotation: SIDE_ROTATION[side], slotWidth: along / count },
        geometry,
      ),
    );
  });

  return {
    shape: 'rectangle',
    body: [rectShape(worldRect({ x: 0, y: 0 }, length, width))],
    tables,
    chairs,
  };
};

const roundRowLayout = (
  row: TableRow,
  type: TableType,
  geometry: ChairGeometry,
  standard: SeatingStandard,
): RowParts => {
  const radius = type.lengthCm / 2;
  const depth = standard.chairDepthCm;
  const pitch = roundPitchOf(type, depth);
  const perTable = roundChairsPerTable(type.lengthCm, depth, geometry.spacing);
  const overrides = overridesByKey(row.chairs);
  const centersLocal = Array.from({ length: row.count }, (_, index) => ({
    x: (index - (row.count - 1) / 2) * pitch,
    y: 0,
  }));
  const tables = centersLocal.map((local, index): PlacedTable => {
    const center = toWorld(local, row, row.rotation);

    return { index, shape: { kind: 'circle', center, radius }, rect: null, center, radius };
  });
  const chairRadius = radius + depth / 2;
  const slotWidth = perTable > 0 ? (2 * Math.PI * chairRadius) / perTable : 0;
  const chairs = centersLocal.flatMap((local, tableIndex) =>
    Array.from({ length: perTable }, (_, seat) => {
      const angle = ((seat + 0.5) * FULL_TURN) / perTable;
      const radians = ((angle - QUARTER_TURN) * Math.PI) / HALF_TURN;

      return placeChair(
        row,
        overrides,
        { side: 'around', index: tableIndex * perTable + seat },
        {
          at: {
            x: local.x + Math.cos(radians) * chairRadius,
            y: local.y + Math.sin(radians) * chairRadius,
          },
          rotation: angle,
          slotWidth,
        },
        geometry,
      );
    }),
  );

  return { shape: 'round', body: tables.map((table) => table.shape), tables, chairs };
};

const seatedCount = (chairs: readonly PlacedChair[]): number =>
  chairs.filter((chair) => chair.state === 'seated').length;

const boundsOfParts = (
  center: Point,
  body: readonly Shape[],
  chairs: readonly PlacedChair[],
): Bounds =>
  unionBounds([
    ...body.map(boundsOfShape),
    ...chairs.filter((chair) => chair.state === 'seated').map((chair) => chair.cell.bounds),
  ]) ?? { minX: center.x, minY: center.y, maxX: center.x, maxY: center.y };

const finish = (row: TableRow, parts: RowParts): RowLayout => ({
  ...parts,
  rowId: row.id,
  groupId: row.groupId,
  center: { x: row.x, y: row.y },
  rotation: row.rotation,
  tableCount: row.count,
  chairCount: seatedCount(parts.chairs),
  bounds: boundsOfParts({ x: row.x, y: row.y }, parts.body, parts.chairs),
});

export const layoutRow = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  planSeating: Seating,
): RowLayout => {
  const geometry = {
    spacing: spacingOf(standard, effectiveSeating(row, planSeating)),
    depth: standard.chairDepthCm,
  };
  const parts =
    type.shape === 'round'
      ? roundRowLayout(row, type, geometry, standard)
      : rectRowLayout(row, type, geometry, standard);

  return finish(row, parts);
};

const withChairs = (layout: RowLayout, chairs: PlacedChair[]): RowLayout => ({
  ...layout,
  chairs,
  chairCount: seatedCount(chairs),
  bounds: boundsOfParts(layout.center, layout.body, chairs),
});

const bodyFootprints = (layout: RowLayout): Footprint[] => layout.body.map(footprintOf);

const dropInnerChairs = (layouts: readonly RowLayout[]): RowLayout[] =>
  layouts.map((layout) => {
    if (layout.groupId === null) {
      return layout;
    }
    const partners = layouts
      .filter((other) => other.groupId === layout.groupId && other.rowId !== layout.rowId)
      .flatMap(bodyFootprints);
    if (partners.length === 0) {
      return layout;
    }

    return withChairs(
      layout,
      layout.chairs.filter(
        (chair) => !partners.some((body) => isClearlyOverlapping(chair.cell, body)),
      ),
    );
  });

const leaveOutClashes = (
  layouts: readonly RowLayout[],
  blockers: readonly Blocker[],
): RowLayout[] => {
  const standing: Footprint[] = [];
  const bodiesOf = new Map(layouts.map((layout) => [layout.rowId, bodyFootprints(layout)]));

  return layouts.map((layout) => {
    const foreignBodies = layouts
      .filter((other) => other.rowId !== layout.rowId)
      .flatMap((other) => bodiesOf.get(other.rowId) ?? []);
    const clashes = (cell: Footprint): boolean =>
      foreignBodies.some((body) => isClearlyOverlapping(cell, body)) ||
      blockers.some((blocker) => isClearlyOverlapping(cell, blocker)) ||
      standing.some((other) => isClearlyOverlapping(cell, other));
    const chairs = layout.chairs.map((chair): PlacedChair => {
      if (chair.state !== 'seated' || chair.kept) {
        return chair;
      }

      return clashes(chair.cell) ? { ...chair, state: 'leftOut' } : chair;
    });
    standing.push(...chairs.filter((chair) => chair.state === 'seated').map((chair) => chair.cell));

    return withChairs(layout, chairs);
  });
};

export const layoutPlan = (
  document: TablePlanDocument,
  types: ReadonlyMap<number, TableType>,
  standard: SeatingStandard,
  blockers: readonly Blocker[] = [],
): RowLayout[] => {
  const single = document.rows.flatMap((row) => {
    const type = types.get(row.tableTypeId);

    return type === undefined ? [] : [layoutRow(row, type, standard, document.seating)];
  });

  return leaveOutClashes(dropInnerChairs(single), blockers);
};

export const planCountsOf = (layouts: readonly RowLayout[]): PlanCounts =>
  layouts.reduce<PlanCounts>(
    (counts, layout) => ({
      tables: counts.tables + layout.tableCount,
      chairs: counts.chairs + layout.chairCount,
    }),
    { tables: 0, chairs: 0 },
  );

export const CLOCKWISE_SIDES: readonly ChairSide[] = ['front', 'end', 'back', 'start', 'around'];

const isReversedOnClockwise = (side: ChairSide): boolean => side === 'back' || side === 'start';

export const clockwiseChairs = (layout: RowLayout): PlacedChair[] =>
  CLOCKWISE_SIDES.flatMap((side) => {
    const onSide = layout.chairs.filter((chair) => chair.side === side);

    return isReversedOnClockwise(side) ? [...onSide].reverse() : onSide;
  });

export const findChair = (layouts: readonly RowLayout[], ref: ChairRef): PlacedChair | null =>
  layouts
    .find((layout) => layout.rowId === ref.rowId)
    ?.chairs.find((chair) => chair.side === ref.side && chair.index === ref.index) ?? null;
