import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkScreenHeaderMeta: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-screen-header-meta
    sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}
  >
    {children}
  </Stack>
);
