import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutOutline: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-focus-outline
    sx={{
      gridArea: 'outline',
      minWidth: 0,
      minHeight: 0,
    }}
  >
    {children}
  </Stack>
);
