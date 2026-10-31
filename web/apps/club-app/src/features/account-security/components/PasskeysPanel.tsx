import { KkAlert } from '@furria/ui/KkAlert';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import type { FC } from 'react';
import type { MePasskey } from '@/lib/api/schemas';
import { usePasskeyAddition } from '../hooks/use-passkey-addition';
import { PasskeyRow } from './PasskeyRow';

const TITLE = 'Passkeys';
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
    <KkPanelSection title={TITLE} action={action}>
      {rejection}
      {list}
      {unavailableNote}
    </KkPanelSection>
  );
};
