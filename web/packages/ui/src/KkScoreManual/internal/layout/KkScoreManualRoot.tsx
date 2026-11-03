import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreManualRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkScoreManualRoot: FC<KkScoreManualRootProps> = ({ label, sx, children }) => (
  <Box
    component="ol"
    aria-label={label}
    data-kk-score-manual
    sx={[
      { listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
