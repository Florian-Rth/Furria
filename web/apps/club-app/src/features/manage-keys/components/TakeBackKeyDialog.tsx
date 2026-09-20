import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import { useKeyReturnForm } from '../hooks/use-key-return-form';
import type { KeyHoldingTarget } from '../manage-keys-labels';
import {
  RETURN_EYEBROW,
  toReturnExplanation,
  toReturnFacts,
  toReturnQuestion,
  toReturnQuickChoices,
} from '../manage-keys-labels';

const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Zurücknehmen';

interface TakeBackKeyDialogProps {
  target: KeyHoldingTarget | null;
  onClose: () => void;
}

export const TakeBackKeyDialog: FC<TakeBackKeyDialogProps> = ({ target, onClose }) => {
  const open = target !== null;
  const venueName = target?.venue.name ?? '';
  const form = useKeyReturnForm({
    holding: target?.holding ?? null,
    venueName,
    onTakenBack: onClose,
  });
  const shown = form.holding;

  if (shown === null) {
    return null;
  }

  const dateField = (
    <KkDateField
      name="untilOn"
      label={DATE_LABEL}
      value={form.untilOn}
      onChange={form.setUntilOn}
      quickChoices={toReturnQuickChoices(new Date())}
      hint={DATE_HINT}
    />
  );

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={form.submit}
      tone="danger"
      eyebrow={RETURN_EYEBROW}
      question={toReturnQuestion(shown.firstName, venueName)}
      explanation={toReturnExplanation(shown.firstName)}
      fields={dateField}
      facts={toReturnFacts(shown, venueName, form.untilOn)}
      consequence={form.consequence ?? undefined}
      error={form.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
