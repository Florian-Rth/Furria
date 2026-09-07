import { KkAvatar, KkIconButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { useMeQuery } from '../api';
import { useSignOut } from '../hooks/use-sign-out';

export const AppShellUserCompact: FC = () => {
  const me = useMeQuery();
  const { signOut, isSigningOut } = useSignOut();

  const initials =
    me.data === undefined ? '' : toInitials(me.data.person.firstName, me.data.person.lastName);

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <KkAvatar initials={initials} />
      <KkIconButton label="Abmelden" icon="logout" disabled={isSigningOut} onClick={signOut} />
    </Stack>
  );
};
