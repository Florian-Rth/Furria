import { moveUnit, orderOf } from '@/features/running-order/running-order-ops';
import type { FindingKind, LineKey, Severity, Suggestion } from '@/features/running-order/schemas';
import type { ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import { unitLeadOf } from './planner-fixes';

export interface ProposalRow {
  key: LineKey;
  from: number | null;
  to: number;
  fromTray: boolean;
  reasons: FindingKind[];
  moreRoom: boolean;
}

export interface ProposalShift {
  kind: FindingKind;
  severity: Severity;
  before: number;
  after: number;
}

const ACT_KEY_PREFIX = 'act:';
const CHANGEOVER_KINDS: readonly FindingKind[] = ['noChangeover', 'tightChangeover'];

const stayingKeysOf = (current: readonly LineKey[], proposed: readonly LineKey[]): LineKey[] => {
  const ranks = proposed.filter((key) => current.includes(key)).map((key) => current.indexOf(key));
  const chains: number[][] = [];

  for (const rank of ranks) {
    const longestBefore = chains
      .filter((chain) => (chain.at(-1) ?? Number.POSITIVE_INFINITY) < rank)
      .reduce<number[]>((best, chain) => (chain.length > best.length ? chain : best), []);

    chains.push([...longestBefore, rank]);
  }

  const longest = chains.reduce<number[]>(
    (best, chain) => (chain.length > best.length ? chain : best),
    [],
  );

  return longest.flatMap((rank) => {
    const key = current[rank];

    return key === undefined ? [] : [key];
  });
};

export const proposalRowsOf = (draft: RunningOrderDraft, suggestion: Suggestion): ProposalRow[] => {
  const current = orderOf(draft);
  const known = draft.lines.map((line) => line.key);
  const staying = stayingKeysOf(current, suggestion.order);
  const isOpen = (key: LineKey): boolean => !staying.includes(key);

  return suggestion.moves
    .filter((move) => known.includes(move.lineKey))
    .filter((move) => isOpen(move.lineKey))
    .map((move) => {
      const at = current.indexOf(move.lineKey);

      const reasons = [...new Set(move.resolved.map((resolved) => resolved.kind))];

      return {
        key: move.lineKey,
        from: at < 0 ? null : at,
        to: move.to,
        fromTray: at < 0,
        reasons,
        moreRoom:
          move.roomFor.length > 0 && !reasons.some((reason) => CHANGEOVER_KINDS.includes(reason)),
      };
    });
};

export const proposedDraftOf = (
  draft: RunningOrderDraft,
  suggestion: Suggestion,
): RunningOrderDraft =>
  suggestion.order.reduce((current, key, index) => {
    const known = current.lines.some((line) => line.key === key);

    return known && unitLeadOf(current, key) === key ? moveUnit(current, key, index) : current;
  }, draft);

export const acceptProposalRow = (draft: RunningOrderDraft, row: ProposalRow): RunningOrderDraft =>
  moveUnit(draft, unitLeadOf(draft, row.key), row.to);

export interface SearchTally {
  before: number;
  after: number;
}

export const seedOf = (suggestion: Suggestion): number[] =>
  suggestion.order.map((key) => Number(key.slice(ACT_KEY_PREFIX.length)));

const countOf = (findings: readonly ReviewFinding[], kind: FindingKind): number =>
  findings.filter((finding) => finding.kind === kind).length;

const severityOf = (findings: readonly ReviewFinding[], kind: FindingKind): Severity =>
  findings.some((finding) => finding.kind === kind && finding.severity === 'conflict')
    ? 'conflict'
    : 'hint';

export const proposalShiftsOf = (
  before: readonly ReviewFinding[],
  after: readonly ReviewFinding[],
): ProposalShift[] => {
  const kinds = [...new Set([...before, ...after].map((finding) => finding.kind))];

  return kinds
    .map((kind) => ({
      kind,
      severity: severityOf([...before, ...after], kind),
      before: countOf(before, kind),
      after: countOf(after, kind),
    }))
    .filter((shift) => shift.before !== shift.after)
    .sort(
      (left, right) =>
        Number(right.severity === 'conflict') - Number(left.severity === 'conflict') ||
        right.before - right.after - (left.before - left.after),
    );
};
