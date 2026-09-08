import { KkFieldRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { ProfileMembershipPanel } from './ProfileMembershipPanel';
import { ProfilePanel } from './ProfilePanel';

const EMPTY_VALUE = 'Nicht hinterlegt';

interface ProfilePanelsProps {
  me: Me;
}

export const ProfilePanels: FC<ProfilePanelsProps> = ({ me }) => {
  const fullName = `${me.person.firstName} ${me.person.lastName}`;

  return (
    <Stack sx={{ gap: 3.5, minWidth: 0 }}>
      <ProfilePanel title="Deine Daten">
        <KkFieldRow label="Name" value={fullName} />
        <KkFieldRow label="Kontakt-E-Mail" value={me.person.email ?? EMPTY_VALUE} />
        <KkFieldRow label="Telefon" value={me.person.phone ?? EMPTY_VALUE} />
      </ProfilePanel>
      <ProfileMembershipPanel membership={me.membership} />
      <ProfilePanel title="Zugang">
        <KkFieldRow label="Anmeldung" value={me.email} />
      </ProfilePanel>
    </Stack>
  );
};
