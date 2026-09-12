import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import type { RolePermissionEntry } from '../manage-roles-labels';
import {
  SELF_LOCKOUT_CONFIRM_LABEL,
  SELF_LOCKOUT_EXPLANATION,
  SELF_LOCKOUT_EYEBROW,
  toSelfLockoutFacts,
  toSelfLockoutQuestion,
} from '../manage-roles-labels';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface SelfLockoutDialogProps {
  roleName: string;
  entry: RolePermissionEntry | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const SelfLockoutDialog: FC<SelfLockoutDialogProps> = ({
  roleName,
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
      eyebrow={SELF_LOCKOUT_EYEBROW}
      question={toSelfLockoutQuestion(entry.title)}
      explanation={SELF_LOCKOUT_EXPLANATION}
      facts={toSelfLockoutFacts(roleName, entry.title)}
      confirmLabel={SELF_LOCKOUT_CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
    />
  );
};
