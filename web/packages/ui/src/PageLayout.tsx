import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

// Layout only — structural slots with no business logic. The standard frame for
// content pages; full-bleed pages (like the landing teaser) own their layout.

const PageLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Container maxWidth="md" component="main" sx={{ flex: 1, py: 8 }}>
    <Stack sx={{ gap: 5 }}>{children}</Stack>
  </Container>
);

const Header: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="header" sx={{ gap: 2, alignItems: 'flex-start' }}>
    {children}
  </Stack>
);

interface ContentProps {
  gap?: number;
}

const Content: FC<PropsWithChildren<ContentProps>> = ({ children, gap = 4 }) => (
  <Stack sx={{ gap }}>{children}</Stack>
);

export const PageLayout = Object.assign(PageLayoutRoot, { Header, Content });
