import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const ROOMY = '@container (min-height: 22rem)';

export const KkStudioSideMedia: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-side-media
    sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      overflow: 'clip',
      containerType: 'size',
      backgroundColor: kkTokens.overlay.scrimInk,
      [ROOMY]: { height: 'auto', aspectRatio: '16 / 9' },
    }}
  >
    {children}
  </Box>
);
