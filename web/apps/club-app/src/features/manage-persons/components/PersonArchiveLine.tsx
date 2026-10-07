import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { usePersonArchive } from '../hooks/use-person-archive';
import {
  ARCHIVE_CONFIRM_LABEL,
  ARCHIVE_EXPLANATION,
  ARCHIVE_EYEBROW,
  ARCHIVE_PERSON_LABEL,
  toArchiveConsequence,
  toArchiveFacts,
  toArchiveQuestion,
} from '../person-archive';
import type { PersonDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface PersonArchiveLineProps {
  person: PersonDetails;
}

export const PersonArchiveLine: FC<PersonArchiveLineProps> = ({ person }) => {
  const archive = usePersonArchive(person);
  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <>
      <KkWriteScreen.Danger label={ARCHIVE_PERSON_LABEL} onSelect={archive.open} />
      <KkConfirmDialog
        open={archive.isOpen}
        onClose={archive.close}
        onConfirm={archive.submit}
        tone="danger"
        eyebrow={ARCHIVE_EYEBROW}
        question={toArchiveQuestion(person)}
        explanation={ARCHIVE_EXPLANATION}
        facts={toArchiveFacts(person, today)}
        consequence={toArchiveConsequence(person, today)}
        error={archive.rejection ?? undefined}
        confirmLabel={ARCHIVE_CONFIRM_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={archive.isSaving}
      />
    </>
  );
};
