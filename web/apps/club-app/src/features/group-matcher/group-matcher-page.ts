import type { KkAnswer } from '@furria/ui/KkAnswerChoice';
import type {
  AdmissionAgeBand,
  GroupMatcherPage,
  GroupMatcherStatus,
  GroupStatement,
  Importance,
  StanceInput,
  StancePosition,
  StatementState,
} from './schemas';
import { ADMISSION_AGE_BANDS } from './schemas';

export const DEFAULT_IMPORTANCE: Importance = 2;

export const POSITION_OF_ANSWER: Record<KkAnswer, StancePosition> = {
  yes: 'yes',
  maybe: 'neutral',
  no: 'no',
};

export const ANSWER_OF_POSITION: Record<StancePosition, KkAnswer> = {
  yes: 'yes',
  neutral: 'maybe',
  no: 'no',
};

const ATTENTION_RANK: Record<StatementState, number> = {
  new: 0,
  changed: 1,
  open: 2,
  answered: 3,
};

const toAttentionOrder = (statements: readonly GroupStatement[]): number[] =>
  statements
    .map((statement, index) => ({ statement, index }))
    .sort(
      (left, right) =>
        ATTENTION_RANK[left.statement.state] - ATTENTION_RANK[right.statement.state] ||
        left.index - right.index,
    )
    .map(({ statement }) => statement.statementId);

const holdsSameStatements = (
  held: readonly number[],
  statements: readonly GroupStatement[],
): boolean =>
  held.length === statements.length &&
  statements.every((statement) => held.includes(statement.statementId));

export const settleStatementOrder = (
  held: readonly number[] | null,
  statements: readonly GroupStatement[],
): readonly number[] =>
  held !== null && holdsSameStatements(held, statements) ? held : toAttentionOrder(statements);

export const inStatementOrder = (
  statements: readonly GroupStatement[],
  order: readonly number[],
): GroupStatement[] =>
  order.flatMap((statementId) =>
    statements.filter((statement) => statement.statementId === statementId),
  );

export const countStatementsAwaitingStance = (statements: readonly GroupStatement[]): number =>
  statements.filter((statement) => statement.state !== 'answered').length;

export const toggleAdmissionAge = (
  selected: readonly AdmissionAgeBand[],
  band: AdmissionAgeBand,
): AdmissionAgeBand[] =>
  ADMISSION_AGE_BANDS.filter((candidate) =>
    candidate === band ? !selected.includes(candidate) : selected.includes(candidate),
  );

export const stanceWithPosition = (
  statement: GroupStatement,
  position: StancePosition,
): StanceInput => ({
  statementId: statement.statementId,
  position,
  importance: statement.importance ?? DEFAULT_IMPORTANCE,
});

export const stanceWithImportance = (
  statement: GroupStatement,
  importance: Importance,
): StanceInput | null =>
  statement.position === null
    ? null
    : { statementId: statement.statementId, position: statement.position, importance };

export const withStance = (
  page: GroupMatcherPage | undefined,
  stance: StanceInput,
): GroupMatcherPage | undefined =>
  page === undefined
    ? undefined
    : {
        ...page,
        statements: page.statements.map((statement) =>
          statement.statementId === stance.statementId
            ? {
                ...statement,
                position: stance.position,
                importance: stance.importance,
                state: 'answered',
              }
            : statement,
        ),
      };

export const withAdmissionAges = (
  page: GroupMatcherPage | undefined,
  admissionAges: readonly AdmissionAgeBand[],
): GroupMatcherPage | undefined =>
  page === undefined ? undefined : { ...page, admissionAges: [...admissionAges] };

export const withoutProposal = (
  page: GroupMatcherPage | undefined,
  statementId: number,
): GroupMatcherPage | undefined =>
  page === undefined
    ? undefined
    : {
        ...page,
        proposals: page.proposals.filter((proposal) => proposal.statementId !== statementId),
      };

export type GroupMatcherStanding =
  | { kind: 'awaiting'; count: number }
  | { kind: 'takingPart' }
  | { kind: 'notTakingPart' };

export const toGroupMatcherStanding = (status: GroupMatcherStatus): GroupMatcherStanding => {
  if (status.openStatements > 0) {
    return { kind: 'awaiting', count: status.openStatements };
  }

  return status.isTakingPart ? { kind: 'takingPart' } : { kind: 'notTakingPart' };
};
