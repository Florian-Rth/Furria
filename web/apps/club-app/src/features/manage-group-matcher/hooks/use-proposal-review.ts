import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import type { WaitingProposal } from '../schemas';
import { isPoolFull, toApprovalText } from '../statement-pool';
import type { StatementTextField } from './use-statement-text-field';
import { useStatementTextField } from './use-statement-text-field';

export interface ProposalReview {
  field: StatementTextField;
  isFull: boolean;
  isBusy: boolean;
  approve: () => void;
  reject: () => void;
}

export const useProposalReview = (proposal: WaitingProposal): ProposalReview => {
  const { pool, operations } = useGroupMatcherHubContext();
  const field = useStatementTextField(proposal.text);

  const approve = (): void => {
    const text = field.validate();

    if (text !== null) {
      operations.approve(proposal.statementId, toApprovalText(proposal, text));
    }
  };

  return {
    field,
    isFull: isPoolFull(pool),
    isBusy: operations.isReviewing,
    approve,
    reject: () => {
      operations.reject(proposal.statementId);
    },
  };
};
