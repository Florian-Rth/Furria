import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutFloat: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-focus-float
    sx={{
      flex: 'none',
      justifyContent: 'center',
      minWidth: 0,
      pt: 0.75,
      zIndex: 4,
    }}
  >
    {children}
  </Stack>
);
