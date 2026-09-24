import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useRestoreGroupMutation } from '../api';
import { useGroupConfirm } from '../hooks/use-group-confirm';
import {
  RESTORE_EXPLANATION,
  RESTORE_EYEBROW,
  toGroupFacts,
  toRestoreConsequence,
  toRestoreQuestion,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const CONFIRM_LABEL = 'Aktivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface RestoreGroupDialogProps {
  group: ManagedGroupSummary;
  open: boolean;
  onClose: () => void;
}

export const RestoreGroupDialog: FC<RestoreGroupDialogProps> = ({ group, open, onClose }) => {
  const mutation = useRestoreGroupMutation();
  const control = useGroupConfirm({ mutation, group, open, onDone: onClose });
  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={RESTORE_EYEBROW}
      question={toRestoreQuestion(group.name)}
      explanation={RESTORE_EXPLANATION}
      facts={toGroupFacts(group, today)}
      consequence={toRestoreConsequence(group.name, group.memberCount, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
