import { tallyOf } from '@/features/running-order/running-order-review';
import type { LineKey } from '@/features/running-order/schemas';
import type { ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import { wishCountOf } from './planner-wishes';
import type { PlannerMode } from './schemas';
import { PLANNER_MODES } from './schemas';

export interface ModeCounts {
  pick: number;
  order: number;
  wishes: number;
  check: number;
}

export const modeCountsOf = (
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
): ModeCounts => {
  const placed = draft.lines.filter((line) => line.placed);
  const tally = tallyOf(findings);

  return {
    pick: draft.lines.length,
    order: placed.filter((line) => line.pinned || line.blockKey !== null).length,
    wishes: wishCountOf(draft),
    check: tally.conflicts + tally.hints,
  };
};

const PHONE_PICTURE_MODES: readonly PlannerMode[] = ['pick', 'check'];

export const showsPictureOf = (mode: PlannerMode, isWide: boolean): boolean =>
  isWide || PHONE_PICTURE_MODES.includes(mode);

export interface RowSpan {
  key: LineKey;
  top: number;
  bottom: number;
}

export type DropEdge = 'before' | 'after';

export interface DropBoundary {
  y: number;
  target: number;
  key: LineKey;
  edge: DropEdge;
}

export const dropBoundariesOf = (
  rows: readonly RowSpan[],
  order: readonly LineKey[],
  unitKeys: readonly LineKey[],
): DropBoundary[] => {
  const from = unitKeys[0] === undefined ? -1 : order.indexOf(unitKeys[0]);
  const targetOf = (index: number): number =>
    from >= 0 && index > from ? index - unitKeys.length : index;
  const others = rows.filter((row) => !unitKeys.includes(row.key));
  const unit = rows.filter((row) => unitKeys.includes(row.key));
  const before = others.map((row) => ({
    y: row.top,
    target: targetOf(order.indexOf(row.key)),
    key: row.key,
    edge: 'before' as const,
  }));
  const last = others.at(-1);
  const after =
    last === undefined
      ? []
      : [
          {
            y: last.bottom,
            target: targetOf(order.indexOf(last.key) + 1),
            key: last.key,
            edge: 'after' as const,
          },
        ];
  const [unitFirst] = unit;
  const unitLast = unit.at(-1);
  const home =
    from < 0 || unitFirst === undefined || unitLast === undefined
      ? []
      : [
          {
            y: (unitFirst.top + unitLast.bottom) / 2,
            target: from,
            key: unitFirst.key,
            edge: 'before' as const,
          },
        ];

  return [...before, ...after, ...home];
};

export const nearestBoundaryOf = (
  boundaries: readonly DropBoundary[],
  y: number,
): DropBoundary | null =>
  boundaries.reduce<DropBoundary | null>(
    (best, boundary) =>
      best === null || Math.abs(boundary.y - y) < Math.abs(best.y - y) ? boundary : best,
    null,
  );

const EDGE_ZONE = 96;
const MAX_SPEED = 18;
const ARM_DISTANCE = 12;

const rampOf = (depth: number): number => Math.ceil(MAX_SPEED * Math.min(1, depth / EDGE_ZONE));

export const autoScrollSpeedOf = (
  pointerY: number,
  grabY: number,
  top: number,
  bottom: number,
): number => {
  const upperEdge = Math.min(top + EDGE_ZONE, grabY - ARM_DISTANCE);
  const lowerEdge = Math.max(bottom - EDGE_ZONE, grabY + ARM_DISTANCE);

  if (pointerY < upperEdge) {
    return -rampOf(upperEdge - pointerY);
  }
  if (pointerY > lowerEdge) {
    return rampOf(pointerY - lowerEdge);
  }

  return 0;
};

export type StepBlock =
  | { reason: 'nonePicked' }
  | { reason: 'unplaced'; count: number }
  | { reason: 'conflicts'; count: number }
  | { reason: 'saving' };

export type FootForward =
  | { kind: 'next'; mode: PlannerMode }
  | { kind: 'confirm' }
  | { kind: 'reopen' };

export type FootPlan =
  | { kind: 'proposal' }
  | { kind: 'steps'; back: PlannerMode | null; forward: FootForward; block: StepBlock | null };

export type ModeTool = 'wishes' | 'autoOrder' | 'suggest';

interface FootSituation {
  mode: PlannerMode;
  proposing: boolean;
  confirmed: boolean;
  picked: number;
  unplaced: number;
  conflicts: number;
  saved: boolean;
}

const neighbourOf = (mode: PlannerMode, step: number): PlannerMode | null =>
  PLANNER_MODES[PLANNER_MODES.indexOf(mode) + step] ?? null;

const blockOf = (situation: FootSituation): StepBlock | null => {
  const { mode, picked, unplaced, conflicts, saved } = situation;

  switch (mode) {
    case 'pick':
      return picked === 0 ? { reason: 'nonePicked' } : null;
    case 'order':
      return unplaced > 0 ? { reason: 'unplaced', count: unplaced } : null;
    case 'check':
      if (picked === 0) {
        return { reason: 'nonePicked' };
      }
      if (conflicts > 0) {
        return { reason: 'conflicts', count: conflicts };
      }

      return saved ? null : { reason: 'saving' };
  }
};

const forwardOf = (mode: PlannerMode, confirmed: boolean): FootForward => {
  const next = neighbourOf(mode, 1);

  if (next !== null) {
    return { kind: 'next', mode: next };
  }

  return confirmed ? { kind: 'reopen' } : { kind: 'confirm' };
};

export const footPlanOf = (situation: FootSituation): FootPlan => {
  if (situation.proposing) {
    return { kind: 'proposal' };
  }

  const forward = forwardOf(situation.mode, situation.confirmed);

  return {
    kind: 'steps',
    back: neighbourOf(situation.mode, -1),
    forward,
    block: forward.kind === 'reopen' ? null : blockOf(situation),
  };
};

const MODE_TOOLS: Record<PlannerMode, readonly ModeTool[]> = {
  pick: [],
  order: ['wishes', 'autoOrder'],
  check: ['suggest'],
};

export const modeToolsOf = (mode: PlannerMode, proposing: boolean): readonly ModeTool[] =>
  proposing ? [] : MODE_TOOLS[mode];

export type PaneView = 'catalogue' | 'findings' | 'wishes';

export const paneViewOf = (mode: PlannerMode, wishesOpen: boolean): PaneView => {
  if (mode === 'pick') {
    return 'catalogue';
  }

  return mode === 'order' && wishesOpen ? 'wishes' : 'findings';
};
