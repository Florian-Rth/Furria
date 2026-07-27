import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const PageLayoutProse: FC<PropsWithChildren> = ({ children }) => (
  <Container
    maxWidth="md"
    data-kk-page-prose
    sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}
  >
    <Stack sx={{ gap: kkTokens.layout.blockGap }}>{children}</Stack>
  </Container>
);
