import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const PASSKEY_CLAIM_LABEL = 'Mit Fingerabdruck bestätigen';

interface RedeemClaimPasskeyProps {
  isRedeeming: boolean;
  error: string | null;
  onConfirm: () => void;
}

export const RedeemClaimPasskey: FC<RedeemClaimPasskeyProps> = ({
  isRedeeming,
  error,
  onConfirm,
}) => {
  const fingerprintIcon = <KkIcon name="fingerprint" size="small" />;
  const errorAlert = error === null ? null : <KkAlert>{error}</KkAlert>;

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      {errorAlert}
      <KkButton
        variant="outlined"
        fullWidth
        startIcon={fingerprintIcon}
        disabled={isRedeeming}
        onClick={onConfirm}
      >
        {PASSKEY_CLAIM_LABEL}
      </KkButton>
    </Stack>
  );
};
