import { KkAlert, KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface OverviewErrorProps {
  message: string;
  onRetry: () => void;
}

export const OverviewError: FC<OverviewErrorProps> = ({ message, onRetry }) => (
  <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
    <KkAlert>{message}</KkAlert>
    <KkButton variant="outlined" onClick={onRetry}>
      Erneut laden
    </KkButton>
  </Stack>
);
