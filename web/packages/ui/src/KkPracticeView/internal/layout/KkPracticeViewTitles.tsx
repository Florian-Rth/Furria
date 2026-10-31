import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeViewTitles: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>{children}</Stack>
);
