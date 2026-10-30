import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkWayRibbonGroup: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ flexShrink: 0, gap: 0.5 }}>
    {children}
  </Stack>
);
