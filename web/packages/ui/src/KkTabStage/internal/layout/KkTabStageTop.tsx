import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkTabStageTop: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ minWidth: 0, alignItems: 'center', gap: 1.5 }}>
    {children}
  </Stack>
);
