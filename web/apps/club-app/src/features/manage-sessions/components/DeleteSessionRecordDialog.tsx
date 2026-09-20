import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { useSessionRemoval } from '../hooks/use-session-removal';
import {
  DELETE_EXPLANATION,
  DELETE_EYEBROW,
  toDeleteConsequence,
  toDeleteQuestion,
  toSessionFacts,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';

const CONFIRM_LABEL = 'Löschen';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface DeleteSessionRecordDialogProps {
  record: SessionRecordSummary | null;
  open: boolean;
  onClose: () => void;
}

export const DeleteSessionRecordDialog: FC<DeleteSessionRecordDialogProps> = ({
  record,
  open,
  onClose,
}) => {
  const control = useSessionRemoval({ record, open, onDone: onClose });

  if (record === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      tone="danger"
      eyebrow={DELETE_EYEBROW}
      question={toDeleteQuestion(record)}
      explanation={DELETE_EXPLANATION}
      facts={toSessionFacts(record)}
      consequence={toDeleteConsequence(record)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
