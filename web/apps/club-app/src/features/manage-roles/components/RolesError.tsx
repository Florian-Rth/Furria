import { KkAlert, KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const RETRY_LABEL = 'Erneut laden';

interface RolesErrorProps {
  message: string;
  onRetry: () => void;
}

export const RolesError: FC<RolesErrorProps> = ({ message, onRetry }) => (
  <Stack sx={{ gap: 2, alignItems: 'flex-start', minWidth: 0 }}>
    <KkAlert>{message}</KkAlert>
    <KkButton variant="outlined" onClick={onRetry}>
      {RETRY_LABEL}
    </KkButton>
  </Stack>
);
