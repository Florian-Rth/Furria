import { KkIconButton } from '@furria/ui';
import type { FC } from 'react';
import { useSignOut } from '../hooks/use-sign-out';

const SIGN_OUT_LABEL = 'Abmelden';

export const AppSignOutButton: FC = () => {
  const { signOut, isSigningOut } = useSignOut();

  return (
    <KkIconButton
      label={SIGN_OUT_LABEL}
      icon="logout"
      size="small"
      disabled={isSigningOut}
      onClick={signOut}
    />
  );
};
