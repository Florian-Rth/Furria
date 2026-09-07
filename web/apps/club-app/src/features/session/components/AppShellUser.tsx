import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useMeQuery } from '../api';
import { useSignOut } from '../hooks/use-sign-out';
import { AppShellIdentity } from './AppShellIdentity';

export const AppShellUser: FC = () => {
  const me = useMeQuery();
  const { signOut, isSigningOut } = useSignOut();

  const identity = me.data === undefined ? null : <AppShellIdentity me={me.data} />;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {identity}
      <KkButton
        variant="outlined"
        fullWidth
        startIcon={<KkIcon name="logout" size="small" />}
        loading={isSigningOut}
        onClick={signOut}
      >
        Abmelden
      </KkButton>
    </Stack>
  );
};
