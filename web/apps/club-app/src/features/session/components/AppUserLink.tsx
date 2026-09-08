import { KkAppShell } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toMembershipTypeLabel } from '@/lib/membership-labels';
import { useMeQuery } from '../api';
import { PROFILE_PATH } from '../app-sections';

const PROFILE_LABEL = 'Profil öffnen';
const NO_MEMBERSHIP = 'Ohne Mitgliedschaft';

export const AppUserLink: FC = () => {
  const me = useMeQuery();

  if (me.data === undefined) {
    return <Stack sx={{ flex: 1 }} />;
  }

  const { person, membership } = me.data;
  const meta = membership === null ? NO_MEMBERSHIP : toMembershipTypeLabel(membership.type);

  return (
    <KkAppShell.Identity
      initials={toInitials(person.firstName, person.lastName)}
      name={`${person.firstName} ${person.lastName}`}
      meta={meta}
      label={PROFILE_LABEL}
      component={Link}
      to={PROFILE_PATH}
    />
  );
};
