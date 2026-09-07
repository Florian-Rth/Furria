import { KkBrandStage } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

export const BootStage: FC = () => (
  <Stack sx={{ minHeight: '100dvh' }}>
    <KkBrandStage>
      <KkBrandStage.Status>ZUGANG WIRD GEPRÜFT</KkBrandStage.Status>
    </KkBrandStage>
  </Stack>
);
