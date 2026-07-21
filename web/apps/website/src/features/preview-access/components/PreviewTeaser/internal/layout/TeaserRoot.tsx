import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const TeaserRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ flex: 1 }}>{children}</Stack>
);
