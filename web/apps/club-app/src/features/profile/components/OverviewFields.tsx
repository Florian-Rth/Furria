import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OverviewFields: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ width: '100%', minWidth: 0, gap: 1.5 }}>{children}</Stack>
);
