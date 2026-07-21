import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const TeaserLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ flex: 1 }}>{children}</Stack>
);

const Masthead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    sx={{
      alignItems: 'center',
      gap: 1,
      py: 3,
      px: 2,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    {children}
  </Stack>
);

const Hero: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="main"
    sx={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 4,
      px: 3,
      py: 10,
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}
  >
    {children}
  </Stack>
);

export const TeaserLayout = Object.assign(TeaserLayoutRoot, { Masthead, Hero });
