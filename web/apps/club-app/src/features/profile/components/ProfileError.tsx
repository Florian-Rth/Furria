import { KkAlert, KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface ProfileErrorProps {
  message: string;
  onRetry: () => void;
}

export const ProfileError: FC<ProfileErrorProps> = ({ message, onRetry }) => (
  <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
    <KkAlert>{message}</KkAlert>
    <KkButton variant="outlined" onClick={onRetry}>
      Erneut laden
    </KkButton>
  </Stack>
);
