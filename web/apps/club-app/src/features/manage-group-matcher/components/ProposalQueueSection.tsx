import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { PROPOSALS_EMPTY, PROPOSALS_LABEL, PROPOSALS_TITLE } from '../group-matcher-hub-copy';
import { isPoolFull } from '../statement-pool';
import { ProposalQueueRow } from './ProposalQueueRow';

export const ProposalQueueSection: FC = () => {
  const { pool, pane } = useGroupMatcherHubContext();
  const selectedId = pane?.kind === 'proposal' ? pane.statementId : null;
  const canApprove = !isPoolFull(pool);
  const rows = pool.proposals.map((proposal) => (
    <ProposalQueueRow
      key={proposal.statementId}
      proposal={proposal}
      canApprove={canApprove}
      selected={proposal.statementId === selectedId}
    />
  ));
  const queue =
    rows.length === 0 ? (
      <KkNote tone="muted" icon="checkCircle">
        {PROPOSALS_EMPTY}
      </KkNote>
    ) : (
      <KkWorkQueue label={PROPOSALS_LABEL}>{rows}</KkWorkQueue>
    );

  return <KkPanelSection title={PROPOSALS_TITLE}>{queue}</KkPanelSection>;
};
