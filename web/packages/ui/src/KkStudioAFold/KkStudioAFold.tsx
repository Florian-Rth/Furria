import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../kk-sx';

const FOLD_SECONDS = 0.36;

interface KkStudioAFoldProps extends PropsWithChildren {
  open: boolean;
  sx?: KkSx;
}

export const KkStudioAFold: FC<KkStudioAFoldProps> = ({ open, sx, children }) => (
  <Box
    data-kk-studio-a-fold={open ? 'open' : 'closed'}
    aria-hidden={!open}
    sx={[
      {
        display: 'grid',
        height: '100%',
        gridTemplateRows: open ? '1fr' : '0fr',
        opacity: open ? 1 : 0,
        transition: `grid-template-rows ${FOLD_SECONDS}s cubic-bezier(.2,.8,.2,1), opacity ${FOLD_SECONDS}s ease`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box sx={{ minHeight: 0, height: '100%', overflow: 'clip' }}>{children}</Box>
  </Box>
);
