import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

// Layout only — structural slots with no business logic.

const DevHomeLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Container maxWidth="md" component="main" sx={{ flex: 1, py: 8 }}>
    <Stack sx={{ gap: 5 }}>{children}</Stack>
  </Container>
);

const Header: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="header" sx={{ gap: 2, alignItems: 'flex-start' }}>
    {children}
  </Stack>
);

const Apps: FC<PropsWithChildren> = ({ children }) => <Stack sx={{ gap: 2 }}>{children}</Stack>;

export const DevHomeLayout = Object.assign(DevHomeLayoutRoot, { Header, Apps });
