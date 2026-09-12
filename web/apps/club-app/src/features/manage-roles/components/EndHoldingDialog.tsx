import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import { useEndHoldingForm } from '../hooks/use-end-holding-form';
import {
  toEndHoldingExplanation,
  toEndHoldingFacts,
  toEndHoldingQuestion,
  toEndQuickChoices,
} from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const EYEBROW = 'Inhaberschaft beenden';
const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Inhaberschaft beenden';

interface EndHoldingDialogProps {
  roleId: number;
  roleName: string;
  holder: RoleHolder | null;
  onClose: () => void;
  onEnded: () => void;
}

export const EndHoldingDialog: FC<EndHoldingDialogProps> = ({
  roleId,
  roleName,
  holder,
  onClose,
  onEnded,
}) => {
  const open = holder !== null;
  const form = useEndHoldingForm({ roleId, roleName, holder, onEnded });
  const target = form.holder;

  if (target === null) {
    return null;
  }

  const dateField = (
    <KkDateField
      name="endedOn"
      label={DATE_LABEL}
      value={form.endedOn}
      onChange={form.setEndedOn}
      quickChoices={toEndQuickChoices(new Date())}
      hint={DATE_HINT}
    />
  );

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={form.submit}
      tone="danger"
      eyebrow={EYEBROW}
      question={toEndHoldingQuestion(target.firstName, roleName)}
      explanation={toEndHoldingExplanation(target.firstName)}
      fields={dateField}
      facts={toEndHoldingFacts(target, roleName, form.endedOn)}
      consequence={form.consequence ?? undefined}
      error={form.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
