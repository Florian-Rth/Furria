import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreDeskListProps extends PropsWithChildren {
  label?: string;
  sx?: KkSx;
}

export const KkScoreDeskList: FC<KkScoreDeskListProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-score-desk-list
    sx={[
      {
        gridArea: 'list',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
