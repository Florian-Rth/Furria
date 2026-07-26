import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface CtaBandRootProps extends PropsWithChildren {
  watermark: ReactNode;
  sx?: SxProps<Theme>;
}

export const CtaBandRoot: FC<CtaBandRootProps> = ({ watermark, sx, children }) => (
  <Stack
    component="section"
    data-kk-cta-band
    sx={[
      {
        position: 'relative',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: kkTokens.layout.gutterX,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {watermark}
    <Container maxWidth="xl" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
      {children}
    </Container>
  </Stack>
);
