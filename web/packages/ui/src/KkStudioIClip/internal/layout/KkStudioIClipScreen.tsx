import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { KK_STUDIO_I_WIDE_SHORT } from '../../../KkStudioIEditor/studio-i-editor-query';
import { kkTokens } from '../../../tokens';

export const KkStudioIClipScreen: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-i-clip-screen
    sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 9',
      display: 'grid',
      containerType: 'size',
      borderRadius: `${kkTokens.radius.base}px`,
      overflow: 'clip',
      backgroundColor: kkTokens.overlay.scrimInk,
      [KK_STUDIO_I_WIDE_SHORT]: { flex: 1, minHeight: 0, aspectRatio: 'auto' },
    }}
  >
    {children}
  </Box>
);
