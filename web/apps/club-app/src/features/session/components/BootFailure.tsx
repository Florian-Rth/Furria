import { KkAlert, KkBrandStage, KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BOOT_FAILURE_MESSAGE, BOOT_RETRY_LABEL } from '../session-messages';

interface BootFailureProps {
  onRetry: () => void;
}

export const BootFailure: FC<BootFailureProps> = ({ onRetry }) => (
  <Stack sx={{ minHeight: '100dvh' }}>
    <KkBrandStage>
      <Stack sx={{ gap: 2, alignItems: 'center' }}>
        <KkAlert severity="warning">{BOOT_FAILURE_MESSAGE}</KkAlert>
        <KkButton variant="outlined" onClick={onRetry}>
          {BOOT_RETRY_LABEL}
        </KkButton>
      </Stack>
    </KkBrandStage>
  </Stack>
);
