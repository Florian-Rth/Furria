import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { ReauthenticationProofFields } from '@/features/account-security';
import { toIsoDay } from '@/lib/day';
import { usePersonDeletion } from '../hooks/use-person-deletion';
import { toRunningTies } from '../person-archive';
import {
  DELETE_CONFIRM_LABEL,
  DELETE_EYEBROW,
  DELETE_PERSON_LABEL,
  toDeletionConsequence,
  toDeletionExplanation,
  toDeletionFacts,
  toDeletionQuestion,
} from '../person-deletion';
import type { PersonDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface PersonDeletionLineProps {
  person: PersonDetails;
}

export const PersonDeletionLine: FC<PersonDeletionLineProps> = ({ person }) => {
  const { proof, isSelf, notice } = usePersonDeletion(person);
  const runningTies = toRunningTies(person, toIsoDay(new Date()));
  const proofFields = <ReauthenticationProofFields control={proof} />;
  const question = toDeletionQuestion(person, isSelf);
  const explanation = toDeletionExplanation(proof.offersPasskey);
  const facts = toDeletionFacts(person);
  const consequence = toDeletionConsequence(runningTies, notice, person.firstName);
  const rejection = proof.rejection ?? undefined;

  return (
    <>
      <KkWriteScreen.Danger label={DELETE_PERSON_LABEL} onSelect={proof.open} />
      <KkConfirmDialog
        open={proof.isOpen}
        onClose={proof.close}
        onConfirm={proof.confirm}
        tone="danger"
        eyebrow={DELETE_EYEBROW}
        question={question}
        explanation={explanation}
        fields={proofFields}
        facts={facts}
        consequence={consequence}
        error={rejection}
        confirmLabel={DELETE_CONFIRM_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={proof.isBusy}
      />
    </>
  );
};
