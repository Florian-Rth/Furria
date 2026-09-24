import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import type { WriteScreenGuard } from '../hooks/use-write-screen';
import {
  WRITE_LEAVE_CANCEL_LABEL,
  WRITE_LEAVE_CONFIRM_LABEL,
  WRITE_LEAVE_EXPLANATION,
  WRITE_LEAVE_EYEBROW,
  WRITE_LEAVE_QUESTION,
} from '../write-messages';

const NO_FACTS: readonly [] = [];

interface WriteLeaveDialogProps {
  guard: WriteScreenGuard;
}

export const WriteLeaveDialog: FC<WriteLeaveDialogProps> = ({ guard }) => (
  <KkConfirmDialog
    open={guard.open}
    onClose={guard.keepEditing}
    onConfirm={guard.discard}
    tone="danger"
    eyebrow={WRITE_LEAVE_EYEBROW}
    question={WRITE_LEAVE_QUESTION}
    explanation={WRITE_LEAVE_EXPLANATION}
    facts={NO_FACTS}
    confirmLabel={WRITE_LEAVE_CONFIRM_LABEL}
    cancelLabel={WRITE_LEAVE_CANCEL_LABEL}
    closeLabel={WRITE_LEAVE_CANCEL_LABEL}
  />
);
