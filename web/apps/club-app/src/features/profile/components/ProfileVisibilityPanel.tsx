import { KkNote, KkPanel, KkPanelHeader, KkSwitchRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MePerson } from '@/lib/api/schemas';
import { useContactVisibility } from '../hooks/use-contact-visibility';
import { PROFILE_SECTION_TITLES } from '../profile-labels';

const SWITCH_LABEL = 'Meine Kontaktdaten für Mitglieder sichtbar';
const SWITCH_STATE_LABEL = { on: 'an', off: 'aus' };
const EXPLANATION =
  'Ist das an, sehen alle eingeloggten Mitglieder in deinem Profil Telefonnummer, E-Mail und Adresse. Ist es aus, steht dort nur der Hinweis, dass du sie nicht freigegeben hast — deine Daten bleiben im Verein hinterlegt.';
const KEY_HOLDER_NOTE =
  'Unabhängig davon: Wer das Recht „Personendetails sehen“ hat, sieht deine Daten immer.';
const OFF_NOTE =
  'Aus heißt aus: Auch deine Gruppen-Admins müssen dich dann über deine Gruppe oder persönlich erreichen.';

interface ProfileVisibilityPanelProps {
  person: MePerson;
}

export const ProfileVisibilityPanel: FC<ProfileVisibilityPanelProps> = ({ person }) => {
  const visibility = useContactVisibility(person.contactVisibleToMembers);

  const offNote = visibility.isVisible ? null : (
    <KkPanel variant="block" sx={{ py: 1.375 }}>
      <KkNote>{OFF_NOTE}</KkNote>
    </KkPanel>
  );

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkPanelHeader title={PROFILE_SECTION_TITLES.visibility} />
      <KkPanel variant="block" tone="raised" sx={{ gap: 1.75 }}>
        <KkSwitchRow
          label={SWITCH_LABEL}
          checked={visibility.isVisible}
          onChange={visibility.toggle}
          description={EXPLANATION}
          stateLabel={SWITCH_STATE_LABEL}
          error={visibility.error}
          busy={visibility.isSaving}
        />
        <KkNote tone="info" icon="permissions">
          {KEY_HOLDER_NOTE}
        </KkNote>
        {offNote}
      </KkPanel>
    </Stack>
  );
};
