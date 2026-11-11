import { toStandingHint } from '../group-matcher-labels';
import { countStatementsAwaitingStance, toGroupMatcherStanding } from '../group-matcher-page';
import type { GroupMatcherPage, GroupStatement } from '../schemas';
import { useStatementOrder } from './use-statement-order';

export interface StatementsSectionView {
  statements: GroupStatement[];
  standingLabel: string;
}

export const useStatementsSection = (page: GroupMatcherPage): StatementsSectionView => {
  const statements = useStatementOrder(page.statements);
  const standing = toGroupMatcherStanding({
    isTakingPart: page.isTakingPart,
    openStatements: countStatementsAwaitingStance(page.statements),
  });

  return { statements, standingLabel: toStandingHint(standing).label };
};
