import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { useAccountDeletion } from '../hooks/use-account-deletion';
import { AccountDeletionPasswordField } from './AccountDeletionPasswordField';

const DELETE_LABEL = 'Account löschen';
const EYEBROW = 'Account';
const QUESTION = 'Deinen Account löschen?';
const EXPLANATION =
  'Du meldest dich danach nicht mehr in der Vereins-App an. Einen neuen Zugang bekommst du nur über eine neue Einladung vom Verein. Bestätige mit deinem Passwort.';
const CONSEQUENCE = 'Deine Vereinsdaten bleiben beim Verein.';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

export const AccountDeletionPanel: FC = () => {
  const control = useAccountDeletion();
  const passwordField = (
    <AccountDeletionPasswordField form={control.form} error={control.passwordError} />
  );

  return (
    <>
      <KkWriteScreen.Danger label={DELETE_LABEL} onSelect={control.open} />
      <KkConfirmDialog
        open={control.isOpen}
        onClose={control.close}
        onConfirm={control.confirm}
        tone="danger"
        eyebrow={EYEBROW}
        question={QUESTION}
        explanation={EXPLANATION}
        fields={passwordField}
        facts={NO_FACTS}
        consequence={CONSEQUENCE}
        error={control.rejection ?? undefined}
        confirmLabel={DELETE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={control.isBusy}
      />
    </>
  );
};
