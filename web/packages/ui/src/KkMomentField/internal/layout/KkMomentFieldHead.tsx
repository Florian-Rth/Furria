import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkMomentFieldHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-moment-field-head
    sx={{ minWidth: 0, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
  >
    {children}
  </Stack>
);
