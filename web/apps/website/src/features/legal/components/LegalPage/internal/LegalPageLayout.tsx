import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

// Layout only — structural slots with no business logic.

const LegalPageLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Container maxWidth="md" component="main" sx={{ flex: 1, py: 8 }}>
    <Stack sx={{ gap: 4 }}>{children}</Stack>
  </Container>
);

const Sections: FC<PropsWithChildren> = ({ children }) => <Stack sx={{ gap: 4 }}>{children}</Stack>;

export const LegalPageLayout = Object.assign(LegalPageLayoutRoot, { Sections });
