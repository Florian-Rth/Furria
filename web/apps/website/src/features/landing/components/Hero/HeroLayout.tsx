import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const HeroLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1.06fr 0.94fr' },
      gap: { xs: 6, md: 8 },
      alignItems: 'center',
      width: '100%',
    }}
  >
    {children}
  </Box>
);

const TextColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack sx={{ alignItems: 'flex-start' }}>{children}</Stack>
);

const PhotoColumn: FC<PropsWithChildren> = ({ children }) => <Box>{children}</Box>;

export const HeroLayout = Object.assign(HeroLayoutRoot, { TextColumn, PhotoColumn });
