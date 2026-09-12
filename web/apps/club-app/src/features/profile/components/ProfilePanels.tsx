import { KkFieldRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { formatIsoDay } from '@/lib/membership-labels';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { ProfileGroupsPanel } from './ProfileGroupsPanel';
import { ProfileMembershipPanel } from './ProfileMembershipPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProfileVisibilityPanel } from './ProfileVisibilityPanel';
import { ProfileVisibilityPreview } from './ProfileVisibilityPreview';

const EMPTY_VALUE = 'Nicht hinterlegt';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const SIGN_IN_LABEL = 'Anmeldung';

interface ProfilePanelsProps {
  me: Me;
}

export const ProfilePanels: FC<ProfilePanelsProps> = ({ me }) => {
  const { person } = me;
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
            <KkFieldRow label={BIRTH_DATE_LABEL} value={birthDate} />
            <KkFieldRow label={SIGN_IN_LABEL} value={me.email} />
          </ProfilePanel>
          <ProfileMembershipPanel membership={me.membership} />
          <ProfileGroupsPanel />
        </Stack>
      </Grid>
    </Grid>
  );
};
