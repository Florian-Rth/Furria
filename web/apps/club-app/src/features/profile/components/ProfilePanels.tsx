import { KkFieldRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import { ProfileMembershipPanel } from './ProfileMembershipPanel';
import { ProfilePanel } from './ProfilePanel';

const EMPTY_VALUE = 'Nicht hinterlegt';

interface ProfilePanelsProps {
  me: Me;
}

export const ProfilePanels: FC<ProfilePanelsProps> = ({ me }) => {
  const { person } = me;
  const fullName = `${person.firstName} ${person.lastName}`;
  const address = formatAddress(person.street, person.zip, person.city) ?? EMPTY_VALUE;
  const birthDate = person.birthDate === null ? EMPTY_VALUE : formatIsoDay(person.birthDate);

  return (
    <Stack sx={{ gap: 3.5, minWidth: 0 }}>
      <ProfilePanel title="Deine Daten">
        <KkFieldRow label="Name" value={fullName} />
        <KkFieldRow label="Kontakt-E-Mail" value={person.email ?? EMPTY_VALUE} />
        <KkFieldRow label="Telefon" value={person.phone ?? EMPTY_VALUE} />
        <KkFieldRow label="Adresse" value={address} />
        <KkFieldRow label="Geburtstag" value={birthDate} />
      </ProfilePanel>
      <ProfileMembershipPanel membership={me.membership} />
      <ProfilePanel title="Zugang">
        <KkFieldRow label="Anmeldung" value={me.email} />
      </ProfilePanel>
    </Stack>
  );
};
