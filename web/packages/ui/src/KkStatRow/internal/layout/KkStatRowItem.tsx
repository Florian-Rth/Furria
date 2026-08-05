import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStatRowItem: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-stat-row-item sx={{ gap: 0.5 }}>
    {children}
  </Stack>
);
