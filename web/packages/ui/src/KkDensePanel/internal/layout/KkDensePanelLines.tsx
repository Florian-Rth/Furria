import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { DENSE_LINE_CONTAINER } from '../dense-panel-paint';

const LIST_FRAME = {
  m: 0,
  p: 0,
  listStyle: 'none',
  minWidth: 0,
  containerType: 'inline-size',
  containerName: DENSE_LINE_CONTAINER,
} as const;

export const KkDensePanelLines: FC<PropsWithChildren> = ({ children }) => (
  <Box component="ul" data-kk-dense-lines sx={LIST_FRAME}>
    {children}
  </Box>
);
