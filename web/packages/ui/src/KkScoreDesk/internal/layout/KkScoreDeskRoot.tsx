import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_SCORE_WIDE_QUERY } from '../logic/use-kk-score-wide';

interface KkScoreDeskRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkScoreDeskRoot: FC<KkScoreDeskRootProps> = ({ sx, children }) => (
  <Box
    data-kk-score-desk
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateAreas: '"intro" "head" "score" "list" "evenings"',
        gap: 1.5,
        minWidth: 0,
        alignItems: 'start',
        [`@media ${KK_SCORE_WIDE_QUERY}`]: {
          gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
          gridTemplateAreas: '"intro intro" "score score" "head pane" "list pane" "evenings pane"',
          gridTemplateRows: 'auto auto auto auto 1fr',
          columnGap: 2,
          rowGap: 1.5,
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
