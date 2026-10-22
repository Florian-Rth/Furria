import { KkButton } from '@furria/ui/KkButton';
import { KkReadout } from '@furria/ui/KkReadout';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { RETRY_LABEL } from '../system-copy';

interface SystemLogFailureProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const SystemLogFailure: FC<SystemLogFailureProps> = ({ message, retrying, onRetry }) => (
  <Stack sx={{ gap: 1, alignItems: 'flex-start', minWidth: 0 }}>
    <KkReadout.Note text={message} level="broken" />
    <KkButton variant="text" size="small" loading={retrying} onClick={onRetry}>
      {RETRY_LABEL}
    </KkButton>
  </Stack>
);
