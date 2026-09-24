import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useRestoreGroupKindMutation } from '../api';
import { useGroupKindConfirm } from '../hooks/use-group-kind-confirm';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  RESTORE_GROUP_KIND_EXPLANATION,
  RESTORE_GROUP_KIND_EYEBROW,
  toGroupKindFacts,
  toRestoreGroupKindConsequence,
  toRestoreGroupKindQuestion,
} from '../manage-groups-labels';

const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Aktivieren';

interface RestoreGroupKindDialogProps {
  kind: GroupKindEntry;
  open: boolean;
  onClose: () => void;
}

export const RestoreGroupKindDialog: FC<RestoreGroupKindDialogProps> = ({
  kind,
  open,
  onClose,
}) => {
  const mutation = useRestoreGroupKindMutation(kind.groupKindId);
  const control = useGroupKindConfirm({
    mutation,
    kindName: kind.name,
    onDone: onClose,
  });
  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={RESTORE_GROUP_KIND_EYEBROW}
      question={toRestoreGroupKindQuestion(kind.name)}
      explanation={RESTORE_GROUP_KIND_EXPLANATION}
      facts={toGroupKindFacts(kind, today)}
      consequence={toRestoreGroupKindConsequence(kind.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
