import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { formatPublishedDay } from '@/lib/announcements';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { APPROVE_LABEL, OPEN_PROPOSAL_LABEL, toProposalFact } from '../group-matcher-hub-copy';
import type { WaitingProposal } from '../schemas';

interface ProposalQueueRowProps {
  proposal: WaitingProposal;
  canApprove: boolean;
  selected: boolean;
}

export const ProposalQueueRow: FC<ProposalQueueRowProps> = ({ proposal, canApprove, selected }) => {
  const { operations, openProposal } = useGroupMatcherHubContext();
  const open = (): void => {
    openProposal(proposal.statementId);
  };
  const approve = (): void => {
    operations.approve(proposal.statementId, null);
  };
  const action = canApprove ? (
    <KkWorkQueue.Action icon="check" label={APPROVE_LABEL} onSelect={approve} />
  ) : undefined;
  const mark = <KkGroupToneDot tone={proposal.proposedBy?.tone ?? null} />;
  const fact = toProposalFact(proposal);
  const day = formatPublishedDay(proposal.proposedAt);

  return (
    <KkWorkQueue.Row
      mark={mark}
      title={proposal.text}
      fact={fact}
      day={day}
      action={action}
      openLabel={OPEN_PROPOSAL_LABEL}
      selected={selected}
      onOpen={open}
    />
  );
};
