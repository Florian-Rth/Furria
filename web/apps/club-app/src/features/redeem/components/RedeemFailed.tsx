import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RedeemFailureKind } from '../redeem-failure';
import { toRedeemFailureMessage } from '../redeem-messages';

const RETRY_LABEL = 'Erneut versuchen';

interface RedeemFailedProps {
  failure: RedeemFailureKind;
  isRetrying: boolean;
  onRetry: () => void;
}

export const RedeemFailed: FC<RedeemFailedProps> = ({ failure, isRetrying, onRetry }) => {
  const message = toRedeemFailureMessage(failure);

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkAlert severity="warning">{message}</KkAlert>
      <KkButton variant="outlined" fullWidth loading={isRetrying} onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    </Stack>
  );
};
