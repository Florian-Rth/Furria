import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import type { RolePermissionEntry } from '../manage-roles-labels';
import {
  KEY_HANDOVER_CONFIRM_LABEL,
  KEY_HANDOVER_EYEBROW,
  toKeyHandoverFacts,
  toKeyHandoverQuestion,
} from '../manage-roles-labels';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface KeyHandoverDialogProps {
  roleName: string;
  holders: readonly { firstName: string; lastName: string }[];
  entry: RolePermissionEntry | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const KeyHandoverDialog: FC<KeyHandoverDialogProps> = ({
  roleName,
  holders,
  entry,
  onConfirm,
  onClose,
}) => {
  if (entry === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      tone="danger"
      eyebrow={KEY_HANDOVER_EYEBROW}
      question={toKeyHandoverQuestion(roleName)}
      explanation={entry.line}
      facts={toKeyHandoverFacts(roleName, holders)}
      confirmLabel={KEY_HANDOVER_CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
    />
  );
};
