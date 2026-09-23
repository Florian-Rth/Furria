import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../../tokens';

const { tapTarget } = kkTokens;

export const GlassDropSlotLayer: FC<PropsWithChildren> = ({ children }) => (
  <Box
    aria-hidden
    data-kk-glass-drop-layer
    sx={{
      position: 'absolute',
      left: 0,
      top: `calc(50% - ${tapTarget} / 2)`,
      width: tapTarget,
      height: tapTarget,
      pointerEvents: 'none',
    }}
  >
    {children}
  </Box>
);
