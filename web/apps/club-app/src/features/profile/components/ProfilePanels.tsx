import { KkFieldRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { ProfileMembershipPanel } from './ProfileMembershipPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProfileVisibilityPanel } from './ProfileVisibilityPanel';
import { ProfileVisibilityPreview } from './ProfileVisibilityPreview';

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
    <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <ProfileVisibilityPanel person={person} />
          <ProfileVisibilityPreview person={person} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 3.5, minWidth: 0 }}>
          <ProfilePanel title={PROFILE_SECTION_TITLES.data}>
            <KkFieldRow label="Name" value={fullName} />
            <KkFieldRow label="Kontakt-E-Mail" value={person.email ?? EMPTY_VALUE} />
            <KkFieldRow label="Telefon" value={person.phone ?? EMPTY_VALUE} />
            <KkFieldRow label="Adresse" value={address} />
            <KkFieldRow label="Geburtstag" value={birthDate} />
          </ProfilePanel>
          <ProfileMembershipPanel membership={me.membership} />
          <ProfilePanel title={PROFILE_SECTION_TITLES.access}>
            <KkFieldRow label="Anmeldung" value={me.email} />
          </ProfilePanel>
        </Stack>
      </Grid>
    </Grid>
  );
};
