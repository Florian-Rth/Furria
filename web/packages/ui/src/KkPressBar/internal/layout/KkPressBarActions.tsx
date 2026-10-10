import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkPressBarActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-press-bar-actions
    sx={{
      gap: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexShrink: 0,
      ml: 'auto',
    }}
  >
    {children}
  </Stack>
);
