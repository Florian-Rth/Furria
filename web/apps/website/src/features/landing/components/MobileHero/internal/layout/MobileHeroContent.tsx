import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MobileHeroContent: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-mobile-hero-content
    sx={{
      position: 'relative',
      zIndex: 2,
      height: '100%',
      justifyContent: 'flex-end',
      gap: 1.5,
      px: kkTokens.layout.gutterX,
      pb: kkTokens.layout.gutterY,
    }}
  >
    {children}
  </Stack>
);
