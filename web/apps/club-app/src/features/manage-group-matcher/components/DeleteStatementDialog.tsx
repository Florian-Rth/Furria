import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import {
  CANCEL_LABEL,
  CLOSE_LABEL,
  DELETE_EXPLANATION,
  DELETE_EYEBROW,
  DELETE_LABEL,
  DELETE_QUESTION,
} from '../group-matcher-hub-copy';

interface DeleteStatementDialogProps {
  open: boolean;
  facts: readonly KkConfirmFact[];
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteStatementDialog: FC<DeleteStatementDialogProps> = ({
  open,
  facts,
  onClose,
  onConfirm,
}) => (
  <KkConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    tone="danger"
    eyebrow={DELETE_EYEBROW}
    question={DELETE_QUESTION}
    explanation={DELETE_EXPLANATION}
    facts={facts}
    confirmLabel={DELETE_LABEL}
    cancelLabel={CANCEL_LABEL}
    closeLabel={CLOSE_LABEL}
  />
);
