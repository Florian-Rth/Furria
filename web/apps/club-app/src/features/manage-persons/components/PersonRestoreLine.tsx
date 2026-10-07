import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { usePersonArchive } from '../hooks/use-person-archive';
import {
  RESTORE_EXPLANATION,
  RESTORE_EYEBROW,
  RESTORE_PERSON_LABEL,
  toRestoreConsequence,
  toRestoreFacts,
  toRestoreQuestion,
} from '../person-archive';
import type { PersonArchive, PersonDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface PersonRestoreLineProps {
  person: PersonDetails;
  archive: PersonArchive;
}

export const PersonRestoreLine: FC<PersonRestoreLineProps> = ({ person, archive }) => {
  const restore = usePersonArchive(person);
  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <>
      <KkWriteScreen.Quiet label={RESTORE_PERSON_LABEL} onSelect={restore.open} />
      <KkConfirmDialog
        open={restore.isOpen}
        onClose={restore.close}
        onConfirm={restore.submit}
        eyebrow={RESTORE_EYEBROW}
        question={toRestoreQuestion(person)}
        explanation={RESTORE_EXPLANATION}
        facts={toRestoreFacts(archive, person)}
        consequence={toRestoreConsequence(person, today)}
        error={restore.rejection ?? undefined}
        confirmLabel={RESTORE_PERSON_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={restore.isSaving}
      />
    </>
  );
};
