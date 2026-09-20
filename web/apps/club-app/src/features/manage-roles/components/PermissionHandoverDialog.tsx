import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import type { RolePermissionEntry } from '../manage-roles-labels';
import {
  PERMISSION_HANDOVER_CONFIRM_LABEL,
  PERMISSION_HANDOVER_EYEBROW,
  toPermissionHandoverFacts,
  toPermissionHandoverQuestion,
} from '../manage-roles-labels';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface PermissionHandoverDialogProps {
  roleName: string;
  holders: readonly { firstName: string; lastName: string }[];
  entry: RolePermissionEntry | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const PermissionHandoverDialog: FC<PermissionHandoverDialogProps> = ({
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
      eyebrow={PERMISSION_HANDOVER_EYEBROW}
      question={toPermissionHandoverQuestion(roleName)}
      explanation={entry.line}
      facts={toPermissionHandoverFacts(roleName, holders)}
      confirmLabel={PERMISSION_HANDOVER_CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
    />
  );
};
