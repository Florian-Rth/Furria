import { KkButton, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useInvitationRound } from '../hooks/use-invitation-round';
import type { InvitationRoundKind } from '../invitation-round-labels';
import { toInvitationRoundAct } from '../invitation-round-labels';
import type { InvitationRoundPreview } from '../schemas';
import { InvitationRoundDialog } from './InvitationRoundDialog';

interface InvitationRoundActionProps {
  kind: InvitationRoundKind;
  preview: InvitationRoundPreview;
}

export const InvitationRoundAction: FC<InvitationRoundActionProps> = ({ kind, preview }) => {
  const act = toInvitationRoundAct(kind, preview);
  const control = useInvitationRound(kind);
  const variant = kind === 'invite' ? 'contained' : 'outlined';

  return (
    <Stack direction="row" sx={{ minWidth: 0, gap: 1.5, alignItems: 'center' }}>
      <KkButton variant={variant} size="small" disabled={!act.canSend} onClick={control.open}>
        {act.actionLabel}
      </KkButton>
      <KkNote tone="muted">{act.statusLine}</KkNote>
      <InvitationRoundDialog
        act={act}
        eligibleWithoutEmailCount={preview.eligibleWithoutEmailCount}
        control={control}
      />
    </Stack>
  );
};
