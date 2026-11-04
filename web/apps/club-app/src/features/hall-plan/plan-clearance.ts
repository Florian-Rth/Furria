import type { Bounds, Shape, ShapeGap } from './plan-geometry';
import { areBoundsApart, boundsOfShape, gapBetween, rectShape, segmentRect } from './plan-geometry';
import type { ChairSide, HallDocument, HallElement, Point, SeatingStandard } from './schemas';
import type { RowLayout } from './table-layout';

export type FindingSeverity = 'conflict' | 'hint';

export type FindingKind =
  | 'chairsOverlap'
  | 'chairsBlocked'
  | 'tablesOverlap'
  | 'tableBlocked'
  | 'exitBlocked'
  | 'narrowAisle';

export interface SideRef {
  rowId: string;
  side: ChairSide;
}

export interface ClearanceFinding {
  key: string;
  severity: FindingSeverity;
  kind: FindingKind;
  from: Point;
  to: Point;
  distanceCm: number;
  rowIds: string[];
  sides: SideRef[];
  blockerId: string | null;
}

export interface Blocker {
  elementId: string;
  exit: boolean;
  shape: Shape;
  bounds: Bounds;
}

interface Part {
  rowId: string;
  side: ChairSide | null;
  shape: Shape;
  bounds: Bounds;
}

const sideKeyOf = (side: ChairSide | null): string => side ?? 'body';

const partsOf = (layout: RowLayout): { bodies: Part[]; zones: Part[] } => ({
  bodies: layout.body.map((shape) => ({
    rowId: layout.rowId,
    side: null,
    shape,
    bounds: boundsOfShape(shape),
  })),
  zones: layout.zones.map((zone) => ({
    rowId: layout.rowId,
    side: zone.side,
    shape: zone.shape,
    bounds: boundsOfShape(zone.shape),
  })),
});

const wallBlockers = (element: Extract<HallElement, { kind: 'wall' }>): Shape[] =>
  element.points.slice(1).flatMap((to, index) => {
    const from = element.points[index];

    return from === undefined ? [] : [rectShape(segmentRect(from, to, element.thicknessCm))];
  });

const blockerShapesOf = (element: HallElement, standard: SeatingStandard): Shape[] => {
  switch (element.kind) {
    case 'wall':
      return wallBlockers(element);
    case 'area':
      return [
        rectShape({
          center: { x: element.x, y: element.y },
          width: element.widthCm,
          height: element.heightCm,
          rotation: element.rotation,
        }),
      ];
    case 'pillar':
      return element.round
        ? [
            {
              kind: 'circle',
              center: { x: element.x, y: element.y },
              radius: Math.max(element.widthCm, element.heightCm) / 2,
            },
          ]
        : [
            rectShape({
              center: { x: element.x, y: element.y },
              width: element.widthCm,
              height: element.heightCm,
              rotation: 0,
            }),
          ];
    case 'door':
      return element.door === 'emergencyExit'
        ? [rectShape(segmentRect(element.from, element.to, 2 * standard.exitClearanceCm))]
        : [];
    default:
      return [];
  }
};

export const blockersOf = (hall: HallDocument, standard: SeatingStandard): Blocker[] =>
  hall.elements.flatMap((element) =>
    blockerShapesOf(element, standard).map((shape) => ({
      elementId: element.id,
      exit: element.kind === 'door',
      shape,
      bounds: boundsOfShape(shape),
    })),
  );

const findingOf = (
  gap: ShapeGap,
  severity: FindingSeverity,
  kind: FindingKind,
  key: string,
  refs: { rowIds: string[]; sides: SideRef[]; blockerId: string | null },
): ClearanceFinding => ({
  key,
  severity,
  kind,
  from: gap.from,
  to: gap.to,
  distanceCm: gap.distance,
  ...refs,
});

const sidesOf = (parts: readonly Part[]): SideRef[] =>
  parts.flatMap((part) => (part.side === null ? [] : [{ rowId: part.rowId, side: part.side }]));

const pairFinding = (a: Part, b: Part, aisle: number): ClearanceFinding | null => {
  if (a.side === null && b.side === null) {
    const gap = gapBetween(a.shape, b.shape);

    return gap.overlaps
      ? findingOf(gap, 'conflict', 'tablesOverlap', `${a.rowId}|${b.rowId}|body`, {
          rowIds: [a.rowId, b.rowId],
          sides: [],
          blockerId: null,
        })
      : null;
  }
  const gap = gapBetween(a.shape, b.shape);
  const refs = { rowIds: [a.rowId, b.rowId], sides: sidesOf([a, b]), blockerId: null };
  const key = `${a.rowId}:${sideKeyOf(a.side)}|${b.rowId}:${sideKeyOf(b.side)}`;
  if (gap.overlaps) {
    return findingOf(gap, 'conflict', 'chairsOverlap', key, refs);
  }

  return gap.distance < aisle ? findingOf(gap, 'hint', 'narrowAisle', key, refs) : null;
};

const blockerFinding = (part: Part, blocker: Blocker, aisle: number): ClearanceFinding | null => {
  const gap = gapBetween(part.shape, blocker.shape);
  const key = `${part.rowId}:${sideKeyOf(part.side)}|${blocker.elementId}`;
  const refs = { rowIds: [part.rowId], sides: sidesOf([part]), blockerId: blocker.elementId };
  if (blocker.exit) {
    return gap.overlaps ? findingOf(gap, 'conflict', 'exitBlocked', key, refs) : null;
  }
  if (gap.overlaps) {
    return findingOf(
      gap,
      'conflict',
      part.side === null ? 'tableBlocked' : 'chairsBlocked',
      key,
      refs,
    );
  }

  return part.side !== null && gap.distance < aisle
    ? findingOf(gap, 'hint', 'narrowAisle', key, refs)
    : null;
};

const isWorseThan = (candidate: ClearanceFinding, current: ClearanceFinding): boolean =>
  candidate.severity !== current.severity
    ? candidate.severity === 'conflict'
    : candidate.distanceCm < current.distanceCm;

const pairKeyOf = (finding: ClearanceFinding): string =>
  finding.blockerId === null
    ? [...finding.rowIds].sort().join('|')
    : `${finding.rowIds.join('|')}#${finding.blockerId}`;

const keepWorstPerPair = (findings: readonly ClearanceFinding[]): ClearanceFinding[] => {
  const worst = new Map<string, ClearanceFinding>();
  const sides = new Map<string, SideRef[]>();
  for (const finding of findings) {
    const pair = pairKeyOf(finding);
    const current = worst.get(pair);
    const merged = [
      ...(sides.get(pair) ?? []),
      ...(finding.severity === 'conflict' ? finding.sides : []),
    ];
    sides.set(
      pair,
      merged.filter(
        (side, index) =>
          merged.findIndex((other) => other.rowId === side.rowId && other.side === side.side) ===
          index,
      ),
    );
    if (current === undefined || isWorseThan(finding, current)) {
      worst.set(pair, finding);
    }
  }

  return [...worst.entries()].map(([pair, finding]) => ({
    ...finding,
    sides: finding.severity === 'conflict' ? (sides.get(pair) ?? finding.sides) : finding.sides,
  }));
};

export const clearanceOf = (
  layouts: readonly RowLayout[],
  blockers: readonly Blocker[],
  standard: SeatingStandard,
): ClearanceFinding[] => {
  const aisle = standard.aisleWidthCm;
  const parts = layouts.map(partsOf);
  const findings: ClearanceFinding[] = [];
  const push = (finding: ClearanceFinding | null): void => {
    if (finding !== null) {
      findings.push(finding);
    }
  };
  parts.forEach((own, index) => {
    const ownAll = [...own.bodies, ...own.zones];
    for (const other of parts.slice(index + 1)) {
      for (const a of ownAll) {
        for (const b of [...other.bodies, ...other.zones]) {
          if (!areBoundsApart(a.bounds, b.bounds, aisle)) {
            push(pairFinding(a, b, aisle));
          }
        }
      }
    }
    for (const part of ownAll) {
      for (const blocker of blockers) {
        if (!areBoundsApart(part.bounds, blocker.bounds, aisle)) {
          push(blockerFinding(part, blocker, aisle));
        }
      }
    }
  });

  return keepWorstPerPair(findings).sort((a, b) =>
    a.severity !== b.severity ? (a.severity === 'conflict' ? -1 : 1) : a.distanceCm - b.distanceCm,
  );
};

export interface FindingTally {
  conflicts: number;
  hints: number;
}

export const tallyFindings = (findings: readonly ClearanceFinding[]): FindingTally => ({
  conflicts: findings.filter((finding) => finding.severity === 'conflict').length,
  hints: findings.filter((finding) => finding.severity === 'hint').length,
});
