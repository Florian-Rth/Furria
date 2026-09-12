import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import { useEndMembershipForm } from '../hooks/use-end-membership-form';
import {
  END_MEMBERSHIP_CONFIRM_LABEL,
  END_MEMBERSHIP_EYEBROW,
  toEndMembershipExplanation,
  toEndMembershipFacts,
  toEndMembershipQuestion,
  toMembershipEndQuickChoices,
} from '../manage-persons-labels';
import type { PersonMembership } from '../schemas';

const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';

interface EndMembershipDialogProps {
  personId: number;
  personName: string;
  firstName: string;
  membership: PersonMembership | null;
  onClose: () => void;
}

export const EndMembershipDialog: FC<EndMembershipDialogProps> = ({
  personId,
  personName,
  firstName,
  membership,
  onClose,
}) => {
  const open = membership !== null;
  const form = useEndMembershipForm({
    personId,
    membership,
    open,
    firstName,
    onEnded: onClose,
  });
  const target = form.membership;

  if (target === null) {
    return null;
  }

  const dateField = (
    <KkDateField
      name="membershipEndedOn"
      label={DATE_LABEL}
      value={form.endedOn}
      onChange={form.setEndedOn}
      quickChoices={toMembershipEndQuickChoices(new Date())}
      hint={DATE_HINT}
    />
  );

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={form.submit}
      eyebrow={END_MEMBERSHIP_EYEBROW}
      question={toEndMembershipQuestion(firstName)}
      explanation={toEndMembershipExplanation(firstName)}
      fields={dateField}
      facts={toEndMembershipFacts(target, personName, form.endedOn)}
      consequence={form.consequence ?? undefined}
      error={form.rejection ?? undefined}
      confirmLabel={END_MEMBERSHIP_CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
