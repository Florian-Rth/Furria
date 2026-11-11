import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStatementList } from '@furria/ui/KkStatementList';
import type { FC } from 'react';
import { useWithdrawProposalMutation } from '../api';
import type { GroupProposal } from '../schemas';
import { ProposalRow } from './ProposalRow';

const SECTION_TITLE = 'Eure Vorschläge';

interface ProposalListProps {
  groupId: number;
  proposals: readonly GroupProposal[];
}

export const ProposalList: FC<ProposalListProps> = ({ groupId, proposals }) => {
  const withdrawProposal = useWithdrawProposalMutation(groupId);

  if (proposals.length === 0) {
    return null;
  }

  const rows = proposals.map((proposal) => (
    <ProposalRow
      key={proposal.statementId}
      proposal={proposal}
      onWithdraw={withdrawProposal.mutate}
    />
  ));

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <KkPanel>
        <KkStatementList label={SECTION_TITLE}>{rows}</KkStatementList>
      </KkPanel>
    </KkPanelSection>
  );
};
