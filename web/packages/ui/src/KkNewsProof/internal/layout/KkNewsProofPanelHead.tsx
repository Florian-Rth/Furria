import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkNewsProofPanelHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    component="figcaption"
    sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 20 }}
  >
    {children}
  </Stack>
);
