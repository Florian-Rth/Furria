import { KkBrandStage } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BOOT_STATUS_MESSAGE } from '../session-messages';

export const BootStage: FC = () => (
  <Stack sx={{ minHeight: '100dvh' }}>
    <KkBrandStage>
      <KkBrandStage.Status>{BOOT_STATUS_MESSAGE}</KkBrandStage.Status>
    </KkBrandStage>
  </Stack>
);
