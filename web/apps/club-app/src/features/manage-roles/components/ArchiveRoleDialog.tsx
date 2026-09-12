import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import type { RoleLifecycleControl } from '../hooks/use-role-lifecycle';
import {
  ARCHIVE_ROLE_EXPLANATION,
  toArchiveRoleConsequence,
  toArchiveRoleFacts,
  toArchiveRoleQuestion,
} from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';

const EYEBROW = 'Rolle archivieren';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Archivieren';

interface ArchiveRoleDialogProps {
  role: RoleDetails;
  open: boolean;
  onClose: () => void;
  lifecycle: RoleLifecycleControl;
}

export const ArchiveRoleDialog: FC<ArchiveRoleDialogProps> = ({
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
      onConfirm={lifecycle.archive}
      eyebrow={EYEBROW}
      question={toArchiveRoleQuestion(role.name)}
      explanation={ARCHIVE_ROLE_EXPLANATION}
      facts={toArchiveRoleFacts(role, today)}
      consequence={toArchiveRoleConsequence(role.name, role.holders.length, today)}
      error={lifecycle.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={lifecycle.isArchiving}
    />
  );
};
