import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useArchiveGroupKindMutation } from '../api';
import { useGroupKindConfirm } from '../hooks/use-group-kind-confirm';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  ARCHIVE_GROUP_KIND_EXPLANATION,
  ARCHIVE_GROUP_KIND_EYEBROW,
  toArchiveGroupKindConsequence,
  toArchiveGroupKindQuestion,
  toGroupKindFacts,
} from '../manage-groups-labels';

const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Archivieren';

interface ArchiveGroupKindDialogProps {
  kind: GroupKindEntry | null;
  onClose: () => void;
}

export const ArchiveGroupKindDialog: FC<ArchiveGroupKindDialogProps> = ({ kind, onClose }) => {
  const mutation = useArchiveGroupKindMutation(kind?.groupKindId ?? 0);
  const control = useGroupKindConfirm({
    mutation,
    kindName: kind?.name ?? '',
    onDone: onClose,
  });
  const today = formatIsoDay(toIsoDay(new Date()));

  if (kind === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={ARCHIVE_GROUP_KIND_EYEBROW}
      question={toArchiveGroupKindQuestion(kind.name)}
      explanation={ARCHIVE_GROUP_KIND_EXPLANATION}
      facts={toGroupKindFacts(kind, today)}
      consequence={toArchiveGroupKindConsequence(kind.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
