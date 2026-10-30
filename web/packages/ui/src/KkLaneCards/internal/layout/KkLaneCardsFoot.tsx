import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkLaneCardsFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
  >
    {children}
  </Stack>
);
