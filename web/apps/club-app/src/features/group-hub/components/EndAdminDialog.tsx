import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import {
  toAdminEndExplanation,
  toAdminEndFacts,
  toAdminEndQuestion,
  toEndQuickChoices,
  toLastAdminWarning,
} from '../group-hub-labels';
import { useEndAdminForm } from '../hooks/use-end-admin-form';
import type { HubAdmin } from '../schemas';

const EYEBROW = 'Gruppen-Admin beenden';
const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Gruppen-Admin beenden';
const SENTENCE_SEPARATOR = ' ';

interface EndAdminDialogProps {
  groupId: number;
  groupName: string;
  admin: HubAdmin | null;
  runningAdmins: number;
  onClose: () => void;
}

export const EndAdminDialog: FC<EndAdminDialogProps> = ({
  groupId,
  groupName,
  admin,
  runningAdmins,
  onClose,
}) => {
  const open = admin !== null;
  const form = useEndAdminForm({ groupId, admin, open, onEnded: onClose });
  const target = form.admin;

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

  const warning = toLastAdminWarning(runningAdmins);
  const consequenceParts = [form.consequence, warning].filter((part) => part !== null);
  const consequence =
    consequenceParts.length === 0 ? undefined : consequenceParts.join(SENTENCE_SEPARATOR);

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={form.submit}
      eyebrow={EYEBROW}
      question={toAdminEndQuestion(target.firstName)}
      explanation={toAdminEndExplanation(target.firstName, groupName)}
      fields={dateField}
      facts={toAdminEndFacts(target, groupName, form.endedOn)}
      consequence={consequence}
      error={form.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
