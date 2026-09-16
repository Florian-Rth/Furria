import { KkButton, KkIcon } from '@furria/ui';
import type { FC } from 'react';
import { useSignOut } from '../hooks/use-sign-out';

const SIGN_OUT_LABEL = 'Abmelden';

export const AppSignOutButton: FC = () => {
  const { signOut, isSigningOut } = useSignOut();

  return (
    <KkButton
      variant="outlined"
      fullWidth
      startIcon={<KkIcon name="logout" size="small" />}
      loading={isSigningOut}
      disabled={isSigningOut}
      onClick={signOut}
    >
      {SIGN_OUT_LABEL}
    </KkButton>
  );
};
