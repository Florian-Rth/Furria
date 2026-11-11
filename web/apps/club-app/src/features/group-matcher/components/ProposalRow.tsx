import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkStatementList } from '@furria/ui/KkStatementList';
import type { FC } from 'react';
import { PROPOSAL_MARKS, WITHDRAW_PROPOSAL_LABEL } from '../group-matcher-labels';
import type { GroupProposal } from '../schemas';

interface ProposalRowProps {
  proposal: GroupProposal;
  onWithdraw: (statementId: number) => void;
}

export const ProposalRow: FC<ProposalRowProps> = ({ proposal, onWithdraw }) => {
  const withdraw = (): void => {
    onWithdraw(proposal.statementId);
  };

  const action =
    proposal.status === 'proposed' ? (
      <KkIconButton label={WITHDRAW_PROPOSAL_LABEL} icon="delete" size="small" onClick={withdraw} />
    ) : null;

  return (
    <KkStatementList.Row
      text={proposal.text}
      mark={PROPOSAL_MARKS[proposal.status]}
      action={action}
    />
  );
};
