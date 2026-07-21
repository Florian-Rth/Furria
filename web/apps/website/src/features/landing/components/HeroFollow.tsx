import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const HeroFollow: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ gap: 3, px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
    {children}
  </Stack>
);
