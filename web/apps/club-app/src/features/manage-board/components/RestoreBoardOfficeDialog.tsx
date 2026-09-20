import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { useRestoreBoardOfficeMutation } from '../api';
import { useBoardOfficeConfirm } from '../hooks/use-board-office-confirm';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  RESTORE_OFFICE_EXPLANATION,
  RESTORE_OFFICE_EYEBROW,
  toBoardOfficeFacts,
  toRestoreOfficeConsequence,
  toRestoreOfficeQuestion,
} from '../manage-board-labels';

const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Aktivieren';

interface RestoreBoardOfficeDialogProps {
  office: BoardOfficeEntry | null;
  onClose: () => void;
}

export const RestoreBoardOfficeDialog: FC<RestoreBoardOfficeDialogProps> = ({
  office,
  onClose,
}) => {
  const mutation = useRestoreBoardOfficeMutation(office?.boardOfficeId ?? 0);
  const control = useBoardOfficeConfirm({
    mutation,
    officeName: office?.name ?? '',
    onDone: onClose,
  });
  const today = toIsoDay(new Date());

  if (office === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={RESTORE_OFFICE_EYEBROW}
      question={toRestoreOfficeQuestion(office.name)}
      explanation={RESTORE_OFFICE_EXPLANATION}
      facts={toBoardOfficeFacts(office, today)}
      consequence={toRestoreOfficeConsequence(office.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
