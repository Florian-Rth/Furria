import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ReauthenticationControl } from '../hooks/use-reauthentication';
import { ReauthenticationPasswordField } from './ReauthenticationPasswordField';

const PASSKEY_PROOF_LABEL = 'Mit Passkey bestätigen';

interface ReauthenticationProofFieldsProps {
  control: ReauthenticationControl;
}

export const ReauthenticationProofFields: FC<ReauthenticationProofFieldsProps> = ({ control }) => {
  const fingerprintIcon = <KkIcon name="fingerprint" size="small" />;
  const passkeyProof = control.offersPasskey ? (
    <KkButton
      variant="text"
      tone="danger"
      fullWidth
      startIcon={fingerprintIcon}
      disabled={control.isBusy}
      onClick={control.confirmWithPasskey}
    >
      {PASSKEY_PROOF_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <ReauthenticationPasswordField form={control.form} error={control.passwordError} />
      {passkeyProof}
    </Stack>
  );
};
