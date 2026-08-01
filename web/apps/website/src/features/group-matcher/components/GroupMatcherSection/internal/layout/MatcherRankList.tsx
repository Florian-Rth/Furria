import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MatcherRankList: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ gap: { xs: 1.5, md: 2 } }}>{children}</Stack>
);
