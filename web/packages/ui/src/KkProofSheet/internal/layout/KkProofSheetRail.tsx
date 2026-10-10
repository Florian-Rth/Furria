import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const STICKY_TOP = kkTokens.shell.barHeight + kkTokens.shell.gutter * 3;

export const KkProofSheetRail: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-proof-rail
    sx={{
      display: { xs: 'none', md: 'block' },
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: '100%',
      mr: 1.5,
    }}
  >
    <Box sx={{ position: 'sticky', top: STICKY_TOP }}>{children}</Box>
  </Box>
);
