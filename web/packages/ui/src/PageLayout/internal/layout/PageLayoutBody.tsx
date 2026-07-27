import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const PageLayoutBody: FC<PropsWithChildren> = ({ children }) => (
  <Container
    maxWidth="xl"
    data-kk-page-body
    sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}
  >
    <Stack sx={{ gap: kkTokens.layout.sectionGap }}>{children}</Stack>
  </Container>
);
