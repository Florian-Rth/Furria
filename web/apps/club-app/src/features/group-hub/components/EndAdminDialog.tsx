import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { useMeQuery } from '@/features/session';
import {
  toAdminEndExplanation,
  toAdminEndFacts,
  toAdminEndParagraph,
  toAdminEndQuestion,
  toEndQuickChoices,
} from '../group-hub-labels';
import { useEndAdminForm } from '../hooks/use-end-admin-form';

const EYEBROW = 'Gruppen-Admin beenden';
const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Gruppen-Admin beenden';

interface EndAdminDialogProps {
  groupId: number;
  groupName: string;
  admin: GroupDetailAdmin | null;
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
  const me = useMeQuery();
  const isSelf = admin !== null && admin.personId === me.data?.person.id;
  const form = useEndAdminForm({ groupId, groupName, admin, isSelf, open, onEnded: onClose });
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

  const consequence = toAdminEndParagraph(form.consequence, isSelf, runningAdmins) ?? undefined;

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={form.submit}
      tone="danger"
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
