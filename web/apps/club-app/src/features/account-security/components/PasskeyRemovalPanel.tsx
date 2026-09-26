import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import type { MePasskey } from '@/lib/api/schemas';
import { usePasskeyRemoval } from '../hooks/use-passkey-removal';

const REMOVE_LABEL = 'Passkey entfernen';
const EYEBROW = 'Passkey';
const QUESTION = 'Diesen Passkey entfernen?';
const EXPLANATION =
  'Mit ihm meldest du dich danach nicht mehr an. Auf deinem Gerät bleibt er gespeichert, bis du ihn dort löschst.';
const CONSEQUENCE = 'Dein Passwort und deine anderen Passkeys gelten weiter.';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface PasskeyRemovalPanelProps {
  passkey: MePasskey;
}

export const PasskeyRemovalPanel: FC<PasskeyRemovalPanelProps> = ({ passkey }) => {
  const control = usePasskeyRemoval(passkey.id);
  const facts = [{ label: 'Passkey', value: passkey.name }];

  return (
    <>
      <KkWriteScreen.Danger label={REMOVE_LABEL} onSelect={control.open} />
      <KkConfirmDialog
        open={control.isOpen}
        onClose={control.close}
        onConfirm={control.confirm}
        tone="danger"
        eyebrow={EYEBROW}
        question={QUESTION}
        explanation={EXPLANATION}
        facts={facts}
        consequence={CONSEQUENCE}
        error={control.rejection ?? undefined}
        confirmLabel={REMOVE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={control.isBusy}
      />
    </>
  );
};
