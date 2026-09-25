import { KkAlert, KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RedeemFailureKind } from '../redeem-failure';
import { toRedeemFailureMessage } from '../redeem-messages';

const RETRY_LABEL = 'Erneut versuchen';

interface RedeemFailedProps {
  failure: RedeemFailureKind;
  onRetry: () => void;
}

export const RedeemFailed: FC<RedeemFailedProps> = ({ failure, onRetry }) => {
  const message = toRedeemFailureMessage(failure);

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkAlert severity="warning">{message}</KkAlert>
      <KkButton variant="outlined" fullWidth onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    </Stack>
  );
};
