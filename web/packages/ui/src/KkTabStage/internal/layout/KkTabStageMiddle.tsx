import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkTabStageMiddle: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
    {children}
  </Stack>
);
