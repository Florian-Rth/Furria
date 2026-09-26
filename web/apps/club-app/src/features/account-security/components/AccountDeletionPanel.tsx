import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { useAccountDeletion } from '../hooks/use-account-deletion';
import { AccountDeletionProofFields } from './AccountDeletionProofFields';

const DELETE_LABEL = 'Account löschen';
const EYEBROW = 'Account';
const QUESTION = 'Deinen Account löschen?';
const EXPLANATION_BY_PASSWORD =
  'Du meldest dich danach nicht mehr in der Vereins-App an. Einen neuen Zugang bekommst du nur über eine neue Einladung vom Verein. Bestätige mit deinem Passwort.';
const EXPLANATION_BY_EITHER =
  'Du meldest dich danach nicht mehr in der Vereins-App an. Einen neuen Zugang bekommst du nur über eine neue Einladung vom Verein. Bestätige mit deinem Passwort oder deinem Passkey.';
const CONSEQUENCE = 'Deine Vereinsdaten bleiben beim Verein.';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

interface AccountDeletionPanelProps {
  hasPasskeys: boolean;
}

export const AccountDeletionPanel: FC<AccountDeletionPanelProps> = ({ hasPasskeys }) => {
  const control = useAccountDeletion(hasPasskeys);
  const proofFields = <AccountDeletionProofFields control={control} />;
  const explanation = control.offersPasskey ? EXPLANATION_BY_EITHER : EXPLANATION_BY_PASSWORD;

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
        explanation={explanation}
        fields={proofFields}
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
