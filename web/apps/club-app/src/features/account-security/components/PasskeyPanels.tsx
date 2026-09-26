import { KkFieldRow, KkPanel, KkPanelSection, KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import type { MePasskey } from '@/lib/api/schemas';
import { formatPasskeyDay } from '../account-security-labels';
import { PasskeyRemovalPanel } from './PasskeyRemovalPanel';

const TITLE = 'Passkey';
const DESCRIPTION =
  'Mit diesem Passkey meldest du dich ohne Passwort an. Er liegt auf deinem Gerät oder in deinem Passwort-Manager.';
const NAME_LABEL = 'Name';
const ADDED_LABEL = 'Hinzugefügt am';

interface PasskeyPanelsProps {
  passkey: MePasskey;
}

export const PasskeyPanels: FC<PasskeyPanelsProps> = ({ passkey }) => {
  const addedOn = formatPasskeyDay(passkey.addedAt, new Date());

  return (
    <KkPanelStack>
      <KkPanelSection title={TITLE} description={DESCRIPTION}>
        <KkPanel>
          <KkFieldRow label={NAME_LABEL} value={passkey.name} />
          <KkFieldRow label={ADDED_LABEL} value={addedOn} />
        </KkPanel>
      </KkPanelSection>
      <PasskeyRemovalPanel passkey={passkey} />
    </KkPanelStack>
  );
};
