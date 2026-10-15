import { KkButton, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useInvitationRound } from '../hooks/use-invitation-round';
import type { InvitationRoundEmphasis, InvitationRoundKind } from '../invitation-round-labels';
import { toInvitationRoundAct } from '../invitation-round-labels';
import type { InvitationRoundPreview } from '../schemas';
import { InvitationRoundDialog } from './InvitationRoundDialog';

type RoundButtonVariant = 'contained' | 'outlined';

const EMPHASIS_VARIANTS: Record<InvitationRoundEmphasis, RoundButtonVariant> = {
  lead: 'contained',
  aside: 'outlined',
};

interface InvitationRoundActionProps {
  kind: InvitationRoundKind;
  preview: InvitationRoundPreview;
  emphasis: InvitationRoundEmphasis;
}

export const InvitationRoundAction: FC<InvitationRoundActionProps> = ({
  kind,
  preview,
  emphasis,
}) => {
  const act = toInvitationRoundAct(kind, preview);
  const control = useInvitationRound(kind);
  const variant = EMPHASIS_VARIANTS[emphasis];

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
