import type { Bounds, OrientedRect, Shape } from './plan-geometry';
import { boundsOfShape, rectShape, toWorld, unionBounds } from './plan-geometry';
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

export interface PlacedChair {
  side: ChairSide;
  index: number;
  center: Point;
  rotation: number;
  removed: boolean;
  number: string | null;
  note: string | null;
}

export interface ChairZone {
  side: ChairSide;
  shape: Shape;
  rect: OrientedRect | null;
  innerRadius: number | null;
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
  shape: TableType['shape'];
  center: Point;
  rotation: number;
  body: Shape[];
  tables: PlacedTable[];
  zones: ChairZone[];
  chairs: PlacedChair[];
  tableCount: number;
  chairCount: number;
  bounds: Bounds;
}

export interface PlanCounts {
  tables: number;
  chairs: number;
}

const FULL_TURN = 360;
const QUARTER_TURN = 90;
const HALF_TURN = 180;

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

const slotsAround = (row: TableRow, type: TableType, standard: SeatingStandard, spacing: number) =>
  row.count * roundChairsPerTable(type.lengthCm, standard.chairDepthCm, spacing);

export const slotCountOf = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  side: ChairSide,
  spacing: number,
): number => {
  if (type.shape === 'round') {
    return side === 'around' ? slotsAround(row, type, standard, spacing) : 0;
  }

  return side === 'around' ? 0 : slotsOnSide(row, type, side, spacing);
};

const chairKeyOf = (key: ChairKey): string => `${key.side}:${key.index}`;

const overridesByKey = (chairs: readonly ChairOverride[]): Map<string, ChairOverride> =>
  new Map(chairs.map((chair) => [chairKeyOf(chair), chair]));

export const chairCountOf = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  planSeating: Seating,
): number => {
  const spacing = spacingOf(standard, effectiveSeating(row, planSeating));
  const sides: readonly ChairSide[] =
    type.shape === 'round' ? ['around'] : ['front', 'back', 'start', 'end'];
  const slots = sides.reduce(
    (sum, side) => sum + slotCountOf(row, type, standard, side, spacing),
    0,
  );
  const removed = new Set(
    row.chairs
      .filter(
        (chair) =>
          chair.removed &&
          chair.index >= 0 &&
          chair.index < slotCountOf(row, type, standard, chair.side, spacing),
      )
      .map(chairKeyOf),
  );

  return slots - removed.size;
};

const placeChair = (
  row: TableRow,
  overrides: Map<string, ChairOverride>,
  key: ChairKey,
  local: Point,
  localRotation: number,
): PlacedChair => {
  const override = overrides.get(chairKeyOf(key));

  return {
    side: key.side,
    index: key.index,
    center: toWorld(local, row, row.rotation),
    rotation: (row.rotation + localRotation + FULL_TURN) % FULL_TURN,
    removed: override?.removed ?? false,
    number: override?.number ?? null,
    note: override?.note ?? null,
  };
};

const evenly = (count: number, length: number): number[] =>
  Array.from({ length: count }, (_, index) => -length / 2 + ((index + 0.5) * length) / count);

const rectRowLayout = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  spacing: number,
): Omit<RowLayout, 'bounds' | 'chairCount' | 'tableCount' | 'rowId' | 'center' | 'rotation'> => {
  const length = rowLengthOf(row, type);
  const width = type.widthCm;
  const depth = standard.chairDepthCm;
  const overrides = overridesByKey(row.chairs);
  const worldRect = (center: Point, rectWidth: number, rectHeight: number): OrientedRect => ({
    center: toWorld(center, row, row.rotation),
    width: rectWidth,
    height: rectHeight,
    rotation: row.rotation,
  });
  const bodyRect = worldRect({ x: 0, y: 0 }, length, width);
  const tables = Array.from({ length: row.count }, (_, index): PlacedTable => {
    const rect = worldRect(
      { x: -length / 2 + (index + 0.5) * type.lengthCm, y: 0 },
      type.lengthCm,
      width,
    );

    return { index, shape: rectShape(rect), rect, center: rect.center, radius: null };
  });
  const zoneSpecs: { side: RectSide; center: Point; width: number; height: number }[] = [
    { side: 'front', center: { x: 0, y: -(width + depth) / 2 }, width: length, height: depth },
    { side: 'back', center: { x: 0, y: (width + depth) / 2 }, width: length, height: depth },
    { side: 'start', center: { x: -(length + depth) / 2, y: 0 }, width: depth, height: width },
    { side: 'end', center: { x: (length + depth) / 2, y: 0 }, width: depth, height: width },
  ];
  const seated = zoneSpecs.filter((spec) => slotsOnSide(row, type, spec.side, spacing) > 0);
  const zones = seated.map((spec): ChairZone => {
    const rect = worldRect(spec.center, spec.width, spec.height);

    return { side: spec.side, shape: rectShape(rect), rect, innerRadius: null };
  });
  const chairOffset = (width + depth) / 2;
  const endOffset = (length + depth) / 2;
  const chairs = seated.flatMap((spec) => {
    const count = slotsOnSide(row, type, spec.side, spacing);
    const along = spec.side === 'front' || spec.side === 'back' ? length : width;

    return evenly(count, along).map((offset, index) => {
      const key = { side: spec.side, index };
      switch (spec.side) {
        case 'front':
          return placeChair(row, overrides, key, { x: offset, y: -chairOffset }, 0);
        case 'back':
          return placeChair(row, overrides, key, { x: offset, y: chairOffset }, HALF_TURN);
        case 'start':
          return placeChair(row, overrides, key, { x: -endOffset, y: offset }, -QUARTER_TURN);
        default:
          return placeChair(row, overrides, key, { x: endOffset, y: offset }, QUARTER_TURN);
      }
    });
  });

  return { shape: 'rectangle', body: [rectShape(bodyRect)], tables, zones, chairs };
};

const roundRowLayout = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  spacing: number,
): Omit<RowLayout, 'bounds' | 'chairCount' | 'tableCount' | 'rowId' | 'center' | 'rotation'> => {
  const radius = type.lengthCm / 2;
  const depth = standard.chairDepthCm;
  const pitch = roundPitchOf(type, depth);
  const perTable = roundChairsPerTable(type.lengthCm, depth, spacing);
  const overrides = overridesByKey(row.chairs);
  const centersLocal = Array.from({ length: row.count }, (_, index) => ({
    x: (index - (row.count - 1) / 2) * pitch,
    y: 0,
  }));
  const tables = centersLocal.map((local, index): PlacedTable => {
    const center = toWorld(local, row, row.rotation);

    return { index, shape: { kind: 'circle', center, radius }, rect: null, center, radius };
  });
  const zones =
    perTable > 0
      ? tables.map(
          (table): ChairZone => ({
            side: 'around',
            shape: { kind: 'circle', center: table.center, radius: radius + depth },
            rect: null,
            innerRadius: radius,
          }),
        )
      : [];
  const chairRadius = radius + depth / 2;
  const chairs = centersLocal.flatMap((local, tableIndex) =>
    Array.from({ length: perTable }, (_, seat) => {
      const angle = ((seat + 0.5) * FULL_TURN) / perTable;
      const radians = ((angle - QUARTER_TURN) * Math.PI) / HALF_TURN;
      const position = {
        x: local.x + Math.cos(radians) * chairRadius,
        y: local.y + Math.sin(radians) * chairRadius,
      };

      return placeChair(
        row,
        overrides,
        { side: 'around', index: tableIndex * perTable + seat },
        position,
        angle,
      );
    }),
  );

  return {
    shape: 'round',
    body: tables.map((table) => table.shape),
    tables,
    zones,
    chairs,
  };
};

export const layoutRow = (
  row: TableRow,
  type: TableType,
  standard: SeatingStandard,
  planSeating: Seating,
): RowLayout => {
  const spacing = spacingOf(standard, effectiveSeating(row, planSeating));
  const parts =
    type.shape === 'round'
      ? roundRowLayout(row, type, standard, spacing)
      : rectRowLayout(row, type, standard, spacing);
  const bounds = unionBounds(
    [...parts.body, ...parts.zones.map((zone) => zone.shape)].map(boundsOfShape),
  ) ?? {
    minX: row.x,
    minY: row.y,
    maxX: row.x,
    maxY: row.y,
  };

  return {
    ...parts,
    rowId: row.id,
    center: { x: row.x, y: row.y },
    rotation: row.rotation,
    tableCount: row.count,
    chairCount: parts.chairs.filter((chair) => !chair.removed).length,
    bounds,
  };
};

export const layoutPlan = (
  document: TablePlanDocument,
  types: ReadonlyMap<number, TableType>,
  standard: SeatingStandard,
): RowLayout[] =>
  document.rows.flatMap((row) => {
    const type = types.get(row.tableTypeId);

    return type === undefined ? [] : [layoutRow(row, type, standard, document.seating)];
  });

export const planCountsOf = (
  document: TablePlanDocument,
  types: ReadonlyMap<number, TableType>,
  standard: SeatingStandard,
): PlanCounts =>
  document.rows.reduce<PlanCounts>(
    (counts, row) => {
      const type = types.get(row.tableTypeId);
      if (type === undefined) {
        return counts;
      }

      return {
        tables: counts.tables + row.count,
        chairs: counts.chairs + chairCountOf(row, type, standard, document.seating),
      };
    },
    { tables: 0, chairs: 0 },
  );

export const CLOCKWISE_SIDES: readonly ChairSide[] = ['front', 'end', 'back', 'start', 'around'];

const isReversedOnClockwise = (side: ChairSide): boolean => side === 'back' || side === 'start';

export const clockwiseChairs = (layout: RowLayout): PlacedChair[] =>
  CLOCKWISE_SIDES.flatMap((side) => {
    const onSide = layout.chairs.filter((chair) => chair.side === side);

    return isReversedOnClockwise(side) ? [...onSide].reverse() : onSide;
  });
