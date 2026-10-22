import { KkButton } from '@furria/ui/KkButton';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import type { AccountLockAct } from '../access-actions';
import {
  ACCESS_STATE_LABEL,
  ACCOUNT_LOCK_COPY,
  toAccountStateChip,
} from '../account-access-labels';
import { useAccountLock } from '../hooks/use-account-lock';
import type { AccessSubject } from '../types';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface AccountLockActionProps {
  subject: AccessSubject;
  act: AccountLockAct;
}

export const AccountLockAction: FC<AccountLockActionProps> = ({ subject, act }) => {
  const control = useAccountLock({ subject, act });
  const copy = ACCOUNT_LOCK_COPY[act];
  const facts = [
    { label: ACCESS_STATE_LABEL, value: toAccountStateChip(subject.access.state).label },
  ];
  const question = copy.question(subject.firstName);
  const consequence = copy.consequence(subject.firstName);
  const error = control.rejection ?? undefined;

  const trigger =
    copy.tone === 'danger' ? (
      <KkWriteScreen.Danger label={copy.actLabel} onSelect={control.open} />
    ) : (
      <KkButton variant="text" fullWidth onClick={control.open}>
        {copy.actLabel}
      </KkButton>
    );

  return (
    <>
      {trigger}
      <KkConfirmDialog
        open={control.isOpen}
        onClose={control.close}
        onConfirm={control.submit}
        tone={copy.tone}
        eyebrow={copy.eyebrow}
        question={question}
        explanation={copy.explanation}
        facts={facts}
        consequence={consequence}
        error={error}
        confirmLabel={copy.confirmLabel}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={control.isSaving}
      />
    </>
  );
};
