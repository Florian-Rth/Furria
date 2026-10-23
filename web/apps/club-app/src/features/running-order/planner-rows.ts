import {
  dissolveBlock,
  formBlock,
  placedLinesOf,
} from '@/features/running-order/running-order-ops';
import type { LineKey } from '@/features/running-order/schemas';
import type { DraftLine, ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';

export type BlockEdge = 'single' | 'start' | 'middle' | 'end';

export interface PlannerLine {
  type: 'line';
  key: LineKey;
  line: DraftLine;
  index: number;
  blockEdge: BlockEdge | null;
  findings: ReviewFinding[];
}

export type RailPlacement = 'between' | 'under';

export interface PlannerRail {
  type: 'rail';
  key: string;
  placement: RailPlacement;
  afterKey: LineKey;
  beforeKey: LineKey | null;
  findings: ReviewFinding[];
}

export type PlannerEntry = PlannerLine | PlannerRail;

const isAdjacentPair = (finding: ReviewFinding, order: readonly LineKey[]): boolean => {
  const [first, second] = finding.lineKeys;

  if (finding.lineKeys.length !== 2 || first === undefined || second === undefined) {
    return false;
  }

  const firstAt = order.indexOf(first);
  const secondAt = order.indexOf(second);

  return firstAt >= 0 && secondAt >= 0 && Math.abs(firstAt - secondAt) === 1;
};

const blockEdgeOf = (placed: readonly DraftLine[], index: number): BlockEdge | null => {
  const line = placed[index];

  if (line === undefined || line.blockKey === null) {
    return null;
  }

  const joinsBefore = placed[index - 1]?.blockKey === line.blockKey;
  const joinsAfter = placed[index + 1]?.blockKey === line.blockKey;

  if (joinsBefore && joinsAfter) {
    return 'middle';
  }
  if (joinsBefore) {
    return 'end';
  }
  if (joinsAfter) {
    return 'start';
  }

  return 'single';
};

export const placeNumberOf = (draft: RunningOrderDraft, key: LineKey): number | null => {
  const index = placedLinesOf(draft).findIndex((line) => line.key === key);

  return index < 0 ? null : index + 1;
};

const findingIdOf = (finding: ReviewFinding): string =>
  [finding.kind, finding.lineKeys.join('|'), finding.ruleKey ?? '', finding.actWishId ?? ''].join(
    ':',
  );

export const plannerEntriesOf = (
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
): PlannerEntry[] => {
  const placed = placedLinesOf(draft);
  const order = placed.map((line) => line.key);
  const listed = findings.filter((finding) => finding.kind !== 'unplaced');
  const railFindings = listed.filter((finding) => isAdjacentPair(finding, order));
  const stripFindings = listed.filter((finding) => !railFindings.includes(finding));
  const anchorOf = (finding: ReviewFinding): LineKey | null =>
    finding.lineKeys.find((key) => order.includes(key)) ?? null;

  return placed.flatMap((line, index): PlannerEntry[] => {
    const entry: PlannerLine = {
      type: 'line',
      key: line.key,
      line,
      index,
      blockEdge: blockEdgeOf(placed, index),
      findings: listed.filter((finding) => finding.lineKeys.includes(line.key)),
    };
    const strips: PlannerRail[] = stripFindings
      .filter((finding) => anchorOf(finding) === line.key)
      .map((finding) => ({
        type: 'rail',
        key: `strip:${findingIdOf(finding)}`,
        placement: 'under',
        afterKey: line.key,
        beforeKey: null,
        findings: [finding],
      }));
    const next = placed[index + 1];
    const between =
      next === undefined
        ? []
        : railFindings.filter(
            (finding) => finding.lineKeys.includes(line.key) && finding.lineKeys.includes(next.key),
          );
    const rail: PlannerRail[] =
      next === undefined || between.length === 0
        ? []
        : [
            {
              type: 'rail',
              key: `rail:${line.key}:${next.key}`,
              placement: 'between',
              afterKey: line.key,
              beforeKey: next.key,
              findings: between,
            },
          ];

    return [entry, ...strips, ...rail];
  });
};

export type RailView = 'none' | 'between' | 'all';

export const visibleEntriesOf = (
  entries: readonly PlannerEntry[],
  view: RailView,
): PlannerEntry[] =>
  entries.filter(
    (entry) =>
      entry.type === 'line' ||
      view === 'all' ||
      (view === 'between' && entry.placement === 'between'),
  );

export const unitKeysOf = (draft: RunningOrderDraft, key: LineKey): LineKey[] => {
  const placed = placedLinesOf(draft);
  const line = placed.find((candidate) => candidate.key === key);

  if (line === undefined || line.blockKey === null) {
    return [key];
  }

  return placed
    .filter((candidate) => candidate.blockKey === line.blockKey)
    .map((candidate) => candidate.key);
};

export const conflictsTouching = (
  findings: readonly ReviewFinding[],
  keys: readonly LineKey[],
): number =>
  findings.filter(
    (finding) =>
      finding.severity === 'conflict' && finding.lineKeys.some((key) => keys.includes(key)),
  ).length;

const nextKeyOf = (draft: RunningOrderDraft, key: LineKey): LineKey | null => {
  const placed = placedLinesOf(draft);
  const next = placed[placed.findIndex((line) => line.key === key) + 1];

  return next?.key ?? null;
};

export const tapBracket = (draft: RunningOrderDraft, key: LineKey): RunningOrderDraft => {
  const line = draft.lines.find((candidate) => candidate.key === key);

  if (line?.blockKey !== null && line?.blockKey !== undefined) {
    return dissolveBlock(draft, key);
  }

  const next = nextKeyOf(draft, key);

  return next === null ? draft : formBlock(draft, key, next);
};
