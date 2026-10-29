import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-e-foot
    sx={{ gap: 1, minWidth: 0, width: '100%', maxWidth: { desktop: '36rem' }, mx: 'auto' }}
  >
    {children}
  </Stack>
);
