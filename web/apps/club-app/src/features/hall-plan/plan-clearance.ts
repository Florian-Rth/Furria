import type { Blocker } from './plan-blockers';
import type { ShapeGap } from './plan-geometry';
import { areBoundsApart, gapBetween, rectShape } from './plan-geometry';
import type { Footprint } from './plan-overlap';
import { footprintOf, isClearlyOverlapping } from './plan-overlap';
import type { Point, SeatingStandard } from './schemas';
import type { ChairRef, PlacedChair, RowLayout } from './table-layout';
import { aisleRectOf } from './table-layout';

export type FindingSeverity = 'conflict' | 'hint';

export type FindingKind =
  | 'chairsOverlap'
  | 'chairsBlocked'
  | 'tablesOverlap'
  | 'tableBlocked'
  | 'exitBlocked'
  | 'narrowAisle';

export interface ClearanceFinding {
  key: string;
  severity: FindingSeverity;
  kind: FindingKind;
  from: Point;
  to: Point;
  distanceCm: number;
  rowIds: string[];
  chairs: ChairRef[];
  blockerId: string | null;
}

interface Body {
  rowId: string;
  footprint: Footprint;
}

interface Seat {
  ref: ChairRef;
  kept: boolean;
  footprint: Footprint;
  aisle: Footprint;
}

interface Obstacle {
  rowId: string | null;
  blockerId: string | null;
  exit: boolean;
  chair: ChairRef | null;
  footprint: Footprint;
}

const bodiesOf = (layout: RowLayout): Body[] =>
  layout.body.map((shape) => ({ rowId: layout.rowId, footprint: footprintOf(shape) }));

const seatOf = (layout: RowLayout, chair: PlacedChair, aisleWidth: number): Seat => ({
  ref: { rowId: layout.rowId, side: chair.side, index: chair.index },
  kept: chair.kept,
  footprint: chair.cell,
  aisle: footprintOf(rectShape(aisleRectOf(chair, aisleWidth))),
});

const seatsOf = (layout: RowLayout, aisleWidth: number): Seat[] =>
  layout.chairs
    .filter((chair) => chair.state === 'seated')
    .map((chair) => seatOf(layout, chair, aisleWidth));

const finding = (
  gap: ShapeGap,
  severity: FindingSeverity,
  kind: FindingKind,
  refs: Pick<ClearanceFinding, 'rowIds' | 'chairs' | 'blockerId'>,
): ClearanceFinding => ({
  key: '',
  severity,
  kind,
  from: gap.from,
  to: gap.to,
  distanceCm: gap.overlaps ? 0 : gap.distance,
  ...refs,
});

const pairKeyOf = (item: Pick<ClearanceFinding, 'rowIds' | 'blockerId'>): string => {
  const rows = [...new Set(item.rowIds)].sort().join('|');

  return item.blockerId === null ? rows : `${rows}#${item.blockerId}`;
};

const bodyFindings = (bodies: readonly Body[], blockers: readonly Blocker[]): ClearanceFinding[] =>
  bodies.flatMap((body, index) => [
    ...bodies
      .slice(index + 1)
      .flatMap((other) =>
        other.rowId !== body.rowId && isClearlyOverlapping(body.footprint, other.footprint)
          ? [
              finding(
                gapBetween(body.footprint.shape, other.footprint.shape),
                'conflict',
                'tablesOverlap',
                { rowIds: [body.rowId, other.rowId], chairs: [], blockerId: null },
              ),
            ]
          : [],
      ),
    ...blockers.flatMap((blocker) =>
      isClearlyOverlapping(body.footprint, blocker)
        ? [
            finding(
              gapBetween(body.footprint.shape, blocker.shape),
              'conflict',
              blocker.exit ? 'exitBlocked' : 'tableBlocked',
              { rowIds: [body.rowId], chairs: [], blockerId: blocker.elementId },
            ),
          ]
        : [],
    ),
  ]);

const obstaclesOf = (
  bodies: readonly Body[],
  seats: readonly Seat[],
  blockers: readonly Blocker[],
): Obstacle[] => [
  ...bodies.map((body) => ({
    rowId: body.rowId,
    blockerId: null,
    exit: false,
    chair: null,
    footprint: body.footprint,
  })),
  ...seats.map((seat) => ({
    rowId: seat.ref.rowId,
    blockerId: null,
    exit: false,
    chair: seat.ref,
    footprint: seat.footprint,
  })),
  ...blockers.map((blocker) => ({
    rowId: null,
    blockerId: blocker.elementId,
    exit: blocker.exit,
    chair: null,
    footprint: blocker,
  })),
];

const clashKindOf = (obstacle: Obstacle): FindingKind => {
  if (obstacle.exit) {
    return 'exitBlocked';
  }

  return obstacle.chair === null ? 'chairsBlocked' : 'chairsOverlap';
};

const refsOf = (
  seat: Seat,
  obstacle: Obstacle,
): Pick<ClearanceFinding, 'rowIds' | 'chairs' | 'blockerId'> => ({
  rowIds: obstacle.rowId === null ? [seat.ref.rowId] : [seat.ref.rowId, obstacle.rowId],
  chairs: obstacle.chair === null ? [seat.ref] : [seat.ref, obstacle.chair],
  blockerId: obstacle.blockerId,
});

const seatFindings = (
  seat: Seat,
  obstacles: readonly Obstacle[],
  aisleWidth: number,
): ClearanceFinding[] =>
  obstacles.flatMap((obstacle) => {
    if (obstacle.rowId === seat.ref.rowId) {
      return [];
    }
    if (areBoundsApart(seat.footprint.bounds, obstacle.footprint.bounds, aisleWidth)) {
      return [];
    }
    if (isClearlyOverlapping(seat.footprint, obstacle.footprint)) {
      return seat.kept
        ? [
            finding(
              gapBetween(seat.footprint.shape, obstacle.footprint.shape),
              'conflict',
              clashKindOf(obstacle),
              refsOf(seat, obstacle),
            ),
          ]
        : [];
    }
    if (obstacle.exit || !isClearlyOverlapping(seat.aisle, obstacle.footprint)) {
      return [];
    }
    const gap = gapBetween(seat.footprint.shape, obstacle.footprint.shape);

    return gap.distance < aisleWidth
      ? [finding(gap, 'hint', 'narrowAisle', { ...refsOf(seat, obstacle), chairs: [seat.ref] })]
      : [];
  });

const isWorseThan = (candidate: ClearanceFinding, current: ClearanceFinding): boolean =>
  candidate.severity !== current.severity
    ? candidate.severity === 'conflict'
    : candidate.distanceCm < current.distanceCm;

const sameChair = (a: ChairRef, b: ChairRef): boolean =>
  a.rowId === b.rowId && a.side === b.side && a.index === b.index;

const mergeChairs = (all: readonly ChairRef[]): ChairRef[] =>
  all.filter((chair, index) => all.findIndex((other) => sameChair(chair, other)) === index);

const keepWorstPerPair = (findings: readonly ClearanceFinding[]): ClearanceFinding[] => {
  const worst = new Map<string, ClearanceFinding>();
  const chairs = new Map<string, ChairRef[]>();
  for (const item of findings) {
    const pair = `${item.severity}|${pairKeyOf(item)}`;
    chairs.set(pair, mergeChairs([...(chairs.get(pair) ?? []), ...item.chairs]));
    const current = worst.get(pair);
    if (current === undefined || isWorseThan(item, current)) {
      worst.set(pair, item);
    }
  }
  const conflictPairs = new Set(
    [...worst.values()].filter((item) => item.severity === 'conflict').map(pairKeyOf),
  );

  return [...worst.entries()]
    .filter(([, item]) => item.severity === 'conflict' || !conflictPairs.has(pairKeyOf(item)))
    .map(([pair, item]) => ({
      ...item,
      key: pair,
      chairs: chairs.get(pair) ?? item.chairs,
    }));
};

export const clearanceOf = (
  layouts: readonly RowLayout[],
  blockers: readonly Blocker[],
  standard: SeatingStandard,
): ClearanceFinding[] => {
  const aisle = standard.aisleWidthCm;
  const bodies = layouts.flatMap(bodiesOf);
  const seats = layouts.flatMap((layout) => seatsOf(layout, aisle));
  const obstacles = obstaclesOf(bodies, seats, blockers);
  const findings = [
    ...bodyFindings(bodies, blockers),
    ...seats.flatMap((seat) => seatFindings(seat, obstacles, aisle)),
  ];

  return keepWorstPerPair(findings).sort((a, b) =>
    a.severity !== b.severity ? (a.severity === 'conflict' ? -1 : 1) : a.distanceCm - b.distanceCm,
  );
};

export interface FindingTally {
  conflicts: number;
  hints: number;
}

export const tallyFindings = (findings: readonly ClearanceFinding[]): FindingTally => ({
  conflicts: findings.filter((item) => item.severity === 'conflict').length,
  hints: findings.filter((item) => item.severity === 'hint').length,
});
