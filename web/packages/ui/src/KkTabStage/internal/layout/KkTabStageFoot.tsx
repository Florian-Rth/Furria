import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkTabStageFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ minWidth: 0, gap: 1.5 }}>{children}</Stack>
);
