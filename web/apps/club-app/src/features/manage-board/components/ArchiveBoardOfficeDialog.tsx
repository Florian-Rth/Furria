import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { useArchiveBoardOfficeMutation } from '../api';
import { useBoardOfficeConfirm } from '../hooks/use-board-office-confirm';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  ARCHIVE_OFFICE_EXPLANATION,
  ARCHIVE_OFFICE_EYEBROW,
  toArchiveOfficeConsequence,
  toArchiveOfficeQuestion,
  toBoardOfficeFacts,
} from '../manage-board-labels';

const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Archivieren';

interface ArchiveBoardOfficeDialogProps {
  office: BoardOfficeEntry | null;
  onClose: () => void;
}

export const ArchiveBoardOfficeDialog: FC<ArchiveBoardOfficeDialogProps> = ({
  office,
  onClose,
}) => {
  const mutation = useArchiveBoardOfficeMutation(office?.boardOfficeId ?? 0);
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
      eyebrow={ARCHIVE_OFFICE_EYEBROW}
      question={toArchiveOfficeQuestion(office.name)}
      explanation={ARCHIVE_OFFICE_EXPLANATION}
      facts={toBoardOfficeFacts(office, today)}
      consequence={toArchiveOfficeConsequence(office.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
