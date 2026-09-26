import { KkAlert, KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePasskeySignIn } from '../hooks/use-passkey-sign-in';

const PASSKEY_SIGN_IN_LABEL = 'Mit Fingerabdruck anmelden';

export const PasskeySignIn: FC = () => {
  const control = usePasskeySignIn();

  if (!control.isAvailable) {
    return null;
  }

  const fingerprintIcon = <KkIcon name="fingerprint" size="small" />;
  const errorAlert =
    control.errorMessage === null ? null : <KkAlert>{control.errorMessage}</KkAlert>;

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      {errorAlert}
      <KkButton
        variant="outlined"
        fullWidth
        startIcon={fingerprintIcon}
        loading={control.isSigningIn}
        onClick={control.signIn}
      >
        {PASSKEY_SIGN_IN_LABEL}
      </KkButton>
    </Stack>
  );
};
