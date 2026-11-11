import { KkButton } from '@furria/ui/KkButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextArea } from '@furria/ui/KkTextArea';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { STATEMENT_MAX_LENGTH } from '@/features/group-matcher/schemas';
import { formatPublishedDay } from '@/lib/announcements';
import {
  APPROVE_LABEL,
  POOL_FULL_NOTE,
  PROPOSAL_PANE_TITLE,
  PROPOSAL_STATE_LABEL,
  REJECT_LABEL,
  STATEMENT_FIELD_LABEL,
  toProposalFact,
} from '../group-matcher-hub-copy';
import { useProposalReview } from '../hooks/use-proposal-review';
import type { WaitingProposal } from '../schemas';
import { GroupMatcherPaneFrame } from './GroupMatcherPaneFrame';

interface ProposalPaneProps {
  proposal: WaitingProposal;
}

export const ProposalPane: FC<ProposalPaneProps> = ({ proposal }) => {
  const review = useProposalReview(proposal);
  const { field } = review;
  const context = `${toProposalFact(proposal)} · ${formatPublishedDay(proposal.proposedAt)}`;
  const hasError = field.error !== undefined;
  const cannotApprove = review.isFull || review.isBusy;
  const fullNote = review.isFull ? (
    <KkNote tone="warning" icon="info">
      {POOL_FULL_NOTE}
    </KkNote>
  ) : null;
  const foot = (
    <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
      <KkButton variant="text" tone="danger" disabled={review.isBusy} onClick={review.reject}>
        {REJECT_LABEL}
      </KkButton>
      <KkButton disabled={cannotApprove} onClick={review.approve}>
        {APPROVE_LABEL}
      </KkButton>
    </Stack>
  );

  return (
    <GroupMatcherPaneFrame
      icon="suggest"
      title={PROPOSAL_PANE_TITLE}
      context={context}
      state="current"
      stateLabel={PROPOSAL_STATE_LABEL}
      foot={foot}
    >
      {fullNote}
      <KkTextArea
        name="statement"
        label={STATEMENT_FIELD_LABEL}
        value={field.text}
        onChange={field.change}
        maxLength={STATEMENT_MAX_LENGTH}
        showCount
        error={hasError}
        helperText={field.error}
      />
    </GroupMatcherPaneFrame>
  );
};
