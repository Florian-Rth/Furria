import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkSessionRowBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-session-row-body
    sx={{ flexGrow: 1, flexBasis: 0, minWidth: 0, alignSelf: 'center', gap: 0.5 }}
  >
    {children}
  </Stack>
);
