import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useArchiveGroupMutation } from '../api';
import { useGroupConfirm } from '../hooks/use-group-confirm';
import {
  ARCHIVE_EXPLANATION,
  ARCHIVE_EYEBROW,
  toArchiveConsequence,
  toArchiveQuestion,
  toGroupFacts,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const CONFIRM_LABEL = 'Archivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface ArchiveGroupDialogProps {
  group: ManagedGroupSummary | null;
  open: boolean;
  onClose: () => void;
}

export const ArchiveGroupDialog: FC<ArchiveGroupDialogProps> = ({ group, open, onClose }) => {
  const mutation = useArchiveGroupMutation();
  const control = useGroupConfirm({ mutation, group, open, onDone: onClose });

  if (group === null) {
    return null;
  }

  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={ARCHIVE_EYEBROW}
      question={toArchiveQuestion(group.name)}
      explanation={ARCHIVE_EXPLANATION}
      facts={toGroupFacts(group, today)}
      consequence={toArchiveConsequence(group.name, group.memberCount, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
