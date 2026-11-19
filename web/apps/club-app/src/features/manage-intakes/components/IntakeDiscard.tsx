import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { useIntakeDiscard } from '../hooks/use-intake-discard';
import {
  CANCEL_LABEL,
  CLOSE_LABEL,
  DISCARD_EXPLANATION,
  DISCARD_EYEBROW,
  DISCARD_LABEL,
  DISCARD_QUESTION,
  toIntakeFacts,
} from '../intake-labels';
import type { IntakeSummary } from '../schemas';

interface IntakeDiscardProps {
  intake: IntakeSummary;
}

export const IntakeDiscard: FC<IntakeDiscardProps> = ({ intake }) => {
  const discard = useIntakeDiscard(intake.intakeId);
  const facts = toIntakeFacts(intake);
  const rejection = discard.rejection ?? undefined;

  return (
    <>
      <KkWriteScreen.Danger label={DISCARD_LABEL} onSelect={discard.open} />
      <KkConfirmDialog
        open={discard.isOpen}
        onClose={discard.close}
        onConfirm={discard.submit}
        tone="danger"
        eyebrow={DISCARD_EYEBROW}
        question={DISCARD_QUESTION}
        explanation={DISCARD_EXPLANATION}
        facts={facts}
        error={rejection}
        confirmLabel={DISCARD_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={discard.isSaving}
      />
    </>
  );
};
