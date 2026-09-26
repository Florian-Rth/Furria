import type { KkPanelAction } from '@furria/ui';
import { KkAlert, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { MePasskey } from '@/lib/api/schemas';
import { usePasskeyAddition } from '../hooks/use-passkey-addition';
import { PasskeyRow } from './PasskeyRow';

const TITLE = 'Passkeys';
const DESCRIPTION =
  'Mit einem Passkey meldest du dich ohne Passwort an – per Fingerabdruck, Gesicht oder Displaysperre deines Geräts. Dein Passwort gilt weiter.';
const ADD_PILL_LABEL = 'Passkey';
const ADD_ACTION_LABEL = 'Passkey hinzufügen';
const NONE_YET = 'Noch kein Passkey eingerichtet.';
const UNAVAILABLE_HERE = 'Auf diesem Gerät kannst du keinen Passkey einrichten.';

interface PasskeysPanelProps {
  passkeys: readonly MePasskey[];
  highlightedKey: string | null;
}

export const PasskeysPanel: FC<PasskeysPanelProps> = ({ passkeys, highlightedKey }) => {
  const addition = usePasskeyAddition();

  const action: KkPanelAction | undefined = addition.isAvailable
    ? {
        label: ADD_PILL_LABEL,
        icon: 'add',
        ariaLabel: ADD_ACTION_LABEL,
        onClick: addition.add,
        disabled: addition.isAdding,
      }
    : undefined;
  const rejection = addition.rejection === null ? null : <KkAlert>{addition.rejection}</KkAlert>;
  const unavailableNote = addition.isAvailable ? null : <KkNote>{UNAVAILABLE_HERE}</KkNote>;
  const rows = passkeys.map((passkey) => (
    <PasskeyRow key={passkey.id} passkey={passkey} highlightedKey={highlightedKey} />
  ));
  const list = passkeys.length === 0 ? <KkNote>{NONE_YET}</KkNote> : <KkPanel>{rows}</KkPanel>;

  return (
    <KkPanelSection title={TITLE} description={DESCRIPTION} action={action}>
      {rejection}
      {list}
      {unavailableNote}
    </KkPanelSection>
  );
};
