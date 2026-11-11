import type { StatementState } from '@/features/group-matcher/schemas';
import { APPROVED_STATEMENT_LIMIT } from '@/features/group-matcher/schemas';
import type {
  GroupCoverage,
  PoolGroup,
  PoolStatement,
  StatementApproval,
  StatementPool,
  StatementWording,
  WaitingProposal,
} from './schemas';

export type GroupMatcherPane =
  | { kind: 'proposal'; statementId: number }
  | { kind: 'statement'; statementId: number };

export interface GroupMatcherPaneMatch {
  routeId: string;
  params: Partial<Record<string, string>>;
}

export interface CoverageTally {
  groupCount: number;
  answered: number;
  changed: number;
  waiting: number;
}

export interface StatementCoverageGroups {
  answered: PoolGroup[];
  changed: PoolGroup[];
  waiting: PoolGroup[];
}

export interface CoverageRow {
  group: PoolGroup;
  isTakingPart: boolean;
  cells: { statementId: number; state: StatementState }[];
}

const PANE_ROUTE_PREFIX = '/_app/manage/group-matcher/';
const NO_PANE_KEY = 'none';
const UNANSWERED_STATES: readonly StatementState[] = ['open', 'new'];

const idOf = (text: string | undefined): number | null => {
  const id = Number(text);

  return Number.isInteger(id) && id > 0 ? id : null;
};

export const groupMatcherPaneOf = (
  match: GroupMatcherPaneMatch | undefined,
): GroupMatcherPane | null => {
  if (match === undefined) {
    return null;
  }

  const statementId = idOf(match.params.statementId);

  if (statementId === null) {
    return null;
  }

  switch (match.routeId.replace(PANE_ROUTE_PREFIX, '')) {
    case 'proposals/$statementId':
      return { kind: 'proposal', statementId };
    case 'statements/$statementId':
      return { kind: 'statement', statementId };
    default:
      return null;
  }
};

export type ResolvedPane =
  | { kind: 'proposal'; proposal: WaitingProposal }
  | { kind: 'statement'; statement: PoolStatement; index: number }
  | { kind: 'gone' };

export const resolvePane = (pool: StatementPool, pane: GroupMatcherPane): ResolvedPane => {
  if (pane.kind === 'proposal') {
    const proposal = pool.proposals.find((entry) => entry.statementId === pane.statementId);

    return proposal === undefined ? { kind: 'gone' } : { kind: 'proposal', proposal };
  }

  const index = pool.statements.findIndex((entry) => entry.statementId === pane.statementId);
  const statement = pool.statements[index];

  return statement === undefined ? { kind: 'gone' } : { kind: 'statement', statement, index };
};

export const isAnsweredByAll = (tally: CoverageTally): boolean =>
  tally.groupCount > 0 && tally.answered === tally.groupCount;

export const groupMatcherPaneKeyOf = (pane: GroupMatcherPane | null): string =>
  pane === null ? NO_PANE_KEY : `${pane.kind}:${pane.statementId}`;

export const isPoolFull = (pool: StatementPool): boolean =>
  pool.statements.length >= APPROVED_STATEMENT_LIMIT;

export const movedOrderOf = (
  statementIds: readonly number[],
  from: number,
  to: number,
): number[] | null => {
  if (from === to || from < 0 || to < 0 || from >= statementIds.length) {
    return null;
  }

  const ids = [...statementIds];
  const [moving] = ids.splice(from, 1);

  if (moving === undefined || to > ids.length) {
    return null;
  }
  ids.splice(to, 0, moving);

  return ids;
};

export const withStatementOrder = (
  pool: StatementPool | undefined,
  statementIds: readonly number[],
): StatementPool | undefined => {
  if (pool === undefined) {
    return undefined;
  }

  const rankOf = (statementId: number): number => {
    const rank = statementIds.indexOf(statementId);

    return rank < 0 ? statementIds.length : rank;
  };

  return {
    ...pool,
    statements: [...pool.statements].sort(
      (left, right) => rankOf(left.statementId) - rankOf(right.statementId),
    ),
  };
};

export const withoutProposal = (
  pool: StatementPool | undefined,
  statementId: number,
): StatementPool | undefined =>
  pool === undefined
    ? undefined
    : {
        ...pool,
        proposals: pool.proposals.filter((proposal) => proposal.statementId !== statementId),
      };

export const withApproval = (
  pool: StatementPool | undefined,
  { statementId, text }: StatementApproval,
): StatementPool | undefined => {
  const proposal = pool?.proposals.find((entry) => entry.statementId === statementId);

  if (pool === undefined || proposal === undefined) {
    return pool;
  }

  return {
    ...pool,
    statements: [
      ...pool.statements,
      {
        statementId,
        text: text ?? proposal.text,
        approvedAt: proposal.proposedAt,
        rewordedAt: null,
      },
    ],
    proposals: pool.proposals.filter((entry) => entry.statementId !== statementId),
  };
};

const withoutCell = (coverage: GroupCoverage, statementId: number): GroupCoverage => ({
  ...coverage,
  cells: coverage.cells.filter((cell) => cell.statementId !== statementId),
});

export const withoutStatement = (
  pool: StatementPool | undefined,
  statementId: number,
): StatementPool | undefined =>
  pool === undefined
    ? undefined
    : {
        ...pool,
        statements: pool.statements.filter((statement) => statement.statementId !== statementId),
        coverage: pool.coverage.map((coverage) => withoutCell(coverage, statementId)),
      };

const flaggedAfterRewording = (state: StatementState): StatementState =>
  state === 'answered' ? 'changed' : state;

export const withRewording = (
  pool: StatementPool | undefined,
  { statementId, text }: StatementWording,
): StatementPool | undefined =>
  pool === undefined
    ? undefined
    : {
        ...pool,
        statements: pool.statements.map((statement) =>
          statement.statementId === statementId ? { ...statement, text } : statement,
        ),
        coverage: pool.coverage.map((coverage) => ({
          ...coverage,
          cells: coverage.cells.map((cell) =>
            cell.statementId === statementId
              ? { ...cell, state: flaggedAfterRewording(cell.state) }
              : cell,
          ),
        })),
      };

const stateOf = (coverage: GroupCoverage, statementId: number): StatementState =>
  coverage.cells.find((cell) => cell.statementId === statementId)?.state ?? 'open';

export const toCoverageRows = (pool: StatementPool): CoverageRow[] =>
  pool.coverage.map((coverage) => ({
    group: coverage.group,
    isTakingPart: coverage.isTakingPart,
    cells: pool.statements.map((statement) => ({
      statementId: statement.statementId,
      state: stateOf(coverage, statement.statementId),
    })),
  }));

export const toStatementCoverageGroups = (
  pool: StatementPool,
  statementId: number,
): StatementCoverageGroups => {
  const groupsIn = (states: readonly StatementState[]): PoolGroup[] =>
    pool.coverage
      .filter((coverage) => states.includes(stateOf(coverage, statementId)))
      .map((coverage) => coverage.group);

  return {
    answered: groupsIn(['answered']),
    changed: groupsIn(['changed']),
    waiting: groupsIn(UNANSWERED_STATES),
  };
};

export const toCoverageTally = (pool: StatementPool, statementId: number): CoverageTally => {
  const groups = toStatementCoverageGroups(pool, statementId);

  return {
    groupCount: pool.coverage.length,
    answered: groups.answered.length,
    changed: groups.changed.length,
    waiting: groups.waiting.length,
  };
};

export const toApprovalText = (proposal: WaitingProposal, draft: string): string | null => {
  const text = draft.trim();

  return text === proposal.text ? null : text;
};
