import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreDeskScoreProps extends PropsWithChildren {
  label?: string;
  sx?: KkSx;
}

export const KkScoreDeskScore: FC<KkScoreDeskScoreProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-score-desk-score
    sx={[
      {
        gridArea: 'score',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
