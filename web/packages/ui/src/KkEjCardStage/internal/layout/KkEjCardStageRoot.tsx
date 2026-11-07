import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEjCardStageRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-ej-card-stage sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
    {children}
  </Stack>
);
