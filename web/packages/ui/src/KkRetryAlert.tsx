import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkAlert } from './KkAlert';
import { KkButton } from './KkButton';
import { KkText } from './KkText';
import type { KkSx } from './kk-sx';

type KkRetryAlertSeverity = 'error' | 'warning';

const DEFAULT_RETRY_LABEL = 'Erneut versuchen';

interface KkRetryAlertProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
  retryLabel?: string;
  severity?: KkRetryAlertSeverity;
  sx?: KkSx;
}

export const KkRetryAlert: FC<KkRetryAlertProps> = ({
  message,
  retrying,
  onRetry,
  retryLabel = DEFAULT_RETRY_LABEL,
  severity = 'error',
  sx,
}) => (
  <KkAlert severity={severity} sx={sx}>
    <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
      <KkText variant="body2">{message}</KkText>
      <KkButton variant="outlined" size="small" loading={retrying} onClick={onRetry}>
        {retryLabel}
      </KkButton>
    </Stack>
  </KkAlert>
);
