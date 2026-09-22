import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import type { RoleLifecycleControl } from '../hooks/use-role-lifecycle';
import {
  RESTORE_ROLE_EXPLANATION,
  RESTORE_ROLE_EYEBROW,
  toRestoreRoleConsequence,
  toRestoreRoleFacts,
  toRestoreRoleQuestion,
} from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';

const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Aktivieren';

interface RestoreRoleDialogProps {
  role: RoleDetails;
  open: boolean;
  onClose: () => void;
  lifecycle: RoleLifecycleControl;
}

export const RestoreRoleDialog: FC<RestoreRoleDialogProps> = ({
  role,
  open,
  onClose,
  lifecycle,
}) => {
  const today = toIsoDay(new Date());

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={lifecycle.restore}
      eyebrow={RESTORE_ROLE_EYEBROW}
      question={toRestoreRoleQuestion(role.name)}
      explanation={RESTORE_ROLE_EXPLANATION}
      facts={toRestoreRoleFacts(role, today)}
      consequence={toRestoreRoleConsequence(role.name, today)}
      error={lifecycle.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={lifecycle.isRestoring}
    />
  );
};
