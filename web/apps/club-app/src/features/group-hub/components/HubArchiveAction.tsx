import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import {
  ARCHIVE_GROUP_EXPLANATION,
  ARCHIVE_GROUP_EYEBROW,
  toArchiveGroupConsequence,
  toArchiveGroupFacts,
  toArchiveGroupQuestion,
} from '../group-hub-labels';
import { useGroupArchive } from '../hooks/use-group-archive';
import type { GroupHub } from '../schemas';

const ARCHIVE_LABEL = 'Gruppe archivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface HubArchiveActionProps {
  hub: GroupHub;
}

export const HubArchiveAction: FC<HubArchiveActionProps> = ({ hub }) => {
  const archive = useGroupArchive(hub);
  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <>
      <KkWriteScreen.Danger label={ARCHIVE_LABEL} onSelect={archive.open} />
      <KkConfirmDialog
        open={archive.isOpen}
        onClose={archive.close}
        onConfirm={archive.submit}
        tone="danger"
        eyebrow={ARCHIVE_GROUP_EYEBROW}
        question={toArchiveGroupQuestion(hub.name)}
        explanation={ARCHIVE_GROUP_EXPLANATION}
        facts={toArchiveGroupFacts(hub, today)}
        consequence={toArchiveGroupConsequence(hub.name, hub.members.length, today)}
        error={archive.rejection ?? undefined}
        confirmLabel={ARCHIVE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={archive.isSaving}
      />
    </>
  );
};
