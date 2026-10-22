import { KkAlert } from '@furria/ui/KkAlert';
import { KkBrandStage } from '@furria/ui/KkBrandStage';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface StageFailureProps {
  message: string;
  action: ReactNode;
}

export const StageFailure: FC<StageFailureProps> = ({ message, action }) => (
  <Stack sx={{ minHeight: '100dvh' }}>
    <KkBrandStage>
      <Stack sx={{ gap: 2, alignItems: 'center' }}>
        <KkAlert severity="warning">{message}</KkAlert>
        {action}
      </Stack>
    </KkBrandStage>
  </Stack>
);
