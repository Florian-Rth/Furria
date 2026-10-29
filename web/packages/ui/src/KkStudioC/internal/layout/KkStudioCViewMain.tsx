import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkStudioCViewMainProps extends PropsWithChildren {
  ratio: number;
  sx?: KkSx;
}

export const KkStudioCViewMain: FC<KkStudioCViewMainProps> = ({ ratio, sx, children }) => (
  <Box
    sx={[
      {
        position: 'relative',
        width: '100%',
        aspectRatio: `${ratio}`,
        borderRadius: `${kkTokens.radius.bar}px`,
        overflow: 'clip',
        backgroundColor: 'film.base',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
