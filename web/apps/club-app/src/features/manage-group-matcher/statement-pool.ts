import type { StatementState } from '@/features/group-matcher/schemas';
import type {
  GroupCoverage,
  PoolGroup,
  PoolStatement,
  StatementAddition,
  StatementPool,
  StatementWording,
} from './schemas';
import { STATEMENT_LIMIT } from './schemas';

export interface GroupMatcherPane {
  kind: 'statement';
  statementId: number;
}

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
const STATEMENT_PANE_ROUTE = 'statements/$statementId';
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

  return match.routeId.replace(PANE_ROUTE_PREFIX, '') === STATEMENT_PANE_ROUTE
    ? { kind: 'statement', statementId }
    : null;
};

export type ResolvedPane =
  | { kind: 'statement'; statement: PoolStatement; index: number }
  | { kind: 'gone' };

export const resolvePane = (pool: StatementPool, pane: GroupMatcherPane): ResolvedPane => {
  const index = pool.statements.findIndex((entry) => entry.statementId === pane.statementId);
  const statement = pool.statements[index];

  return statement === undefined ? { kind: 'gone' } : { kind: 'statement', statement, index };
};

export const isAnsweredByAll = (tally: CoverageTally): boolean =>
  tally.groupCount > 0 && tally.answered === tally.groupCount;

export const groupMatcherPaneKeyOf = (pane: GroupMatcherPane | null): string =>
  pane === null ? NO_PANE_KEY : `${pane.kind}:${pane.statementId}`;

export const isPoolFull = (pool: StatementPool): boolean =>
  pool.statements.length >= STATEMENT_LIMIT;

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

export const withAddition = (
  pool: StatementPool | undefined,
  { provisionalId, text, addedAt }: StatementAddition,
): StatementPool | undefined =>
  pool === undefined
    ? undefined
    : {
        ...pool,
        statements: [
          ...pool.statements,
          { statementId: provisionalId, text, addedAt, rewordedAt: null },
        ],
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
