import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreDeskIntroProps extends PropsWithChildren {
  label?: string;
  sx?: KkSx;
}

export const KkScoreDeskIntro: FC<KkScoreDeskIntroProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-score-desk-intro
    sx={[
      {
        gridArea: 'intro',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
