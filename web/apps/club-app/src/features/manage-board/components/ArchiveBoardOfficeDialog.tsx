import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { useBoardOfficeLifecycle } from '../hooks/use-board-office-lifecycle';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  ARCHIVE_OFFICE_EXPLANATION,
  toArchiveOfficeConsequence,
  toArchiveOfficeFacts,
  toArchiveOfficeQuestion,
} from '../manage-board-labels';

const EYEBROW = 'Vorstandsfunktion archivieren';
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
  const lifecycle = useBoardOfficeLifecycle({
    boardOfficeId: office?.boardOfficeId ?? 0,
    officeName: office?.name ?? '',
    onArchived: onClose,
  });
  const today = toIsoDay(new Date());

  if (office === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open
      tone="danger"
      onClose={onClose}
      onConfirm={lifecycle.archive}
      eyebrow={EYEBROW}
      question={toArchiveOfficeQuestion(office.name)}
      explanation={ARCHIVE_OFFICE_EXPLANATION}
      facts={toArchiveOfficeFacts(office, today)}
      consequence={toArchiveOfficeConsequence(office.name, today)}
      error={lifecycle.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={lifecycle.isArchiving}
    />
  );
};
