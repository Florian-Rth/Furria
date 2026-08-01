import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MatcherMatchHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ gap: 1.5, p: { xs: 2, md: 3 } }}>{children}</Stack>
);
