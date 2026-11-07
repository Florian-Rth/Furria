import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEjPhoneHeadName: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ flex: '1 1 auto', minWidth: 0, justifyContent: 'center', gap: 0.125 }}>
    {children}
  </Stack>
);
