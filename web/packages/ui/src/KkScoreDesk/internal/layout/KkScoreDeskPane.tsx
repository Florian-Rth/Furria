import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const STICKY_TOP = `${kkTokens.shell.gutter * 2 + kkTokens.shell.barHeight}px`;

interface KkScoreDeskPaneProps extends PropsWithChildren {
  label?: string;
  sx?: KkSx;
}

export const KkScoreDeskPane: FC<KkScoreDeskPaneProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-score-desk-pane
    sx={[
      {
        gridArea: 'pane',
        minWidth: 0,
        position: 'sticky',
        top: STICKY_TOP,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
