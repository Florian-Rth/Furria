import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const HIDDEN_FROM_SIGHT = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export const KkVisuallyHidden: FC<PropsWithChildren> = ({ children }) => (
  <Box component="span" data-kk-visually-hidden sx={HIDDEN_FROM_SIGHT}>
    {children}
  </Box>
);
