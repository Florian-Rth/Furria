import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import {
  toEndExplanation,
  toEndFacts,
  toEndQuestion,
  toEndQuickChoices,
} from '../group-hub-labels';
import { useEndMembershipForm } from '../hooks/use-end-membership-form';
import type { HubMember } from '../schemas';

const EYEBROW = 'Zugehörigkeit beenden';
const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Zugehörigkeit beenden';

interface EndMembershipDialogProps {
  groupId: number;
  groupName: string;
  member: HubMember | null;
  onClose: () => void;
}

export const EndMembershipDialog: FC<EndMembershipDialogProps> = ({
  groupId,
  groupName,
  member,
  onClose,
}) => {
  const open = member !== null;
  const form = useEndMembershipForm({ groupId, member, open, onEnded: onClose });
  const target = form.member;

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
      eyebrow={EYEBROW}
      question={toEndQuestion(target.firstName, groupName)}
      explanation={toEndExplanation(target.firstName)}
      fields={dateField}
      facts={toEndFacts(target, groupName, form.endedOn)}
      consequence={form.consequence ?? undefined}
      error={form.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
