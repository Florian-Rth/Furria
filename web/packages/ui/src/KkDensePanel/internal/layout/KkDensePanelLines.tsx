import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const LIST_RESET = { m: 0, p: 0, listStyle: 'none', minWidth: 0 } as const;

export const KkDensePanelLines: FC<PropsWithChildren> = ({ children }) => (
  <Box component="ul" data-kk-dense-lines sx={LIST_RESET}>
    {children}
  </Box>
);
