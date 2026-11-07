import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { kkTokens } from '../../../tokens';

const SCROLL_CLEARANCE = `${kkTokens.shell.gutter * 2 + kkTokens.shell.barHeight + kkTokens.shell.chromeGap}px`;

interface KkScoreManualGroupProps extends PropsWithChildren {
  head: ReactNode;
  anchor?: string;
}

export const KkScoreManualGroup: FC<KkScoreManualGroupProps> = ({ head, anchor, children }) => (
  <Box
    component="li"
    id={anchor}
    data-kk-score-manual-group
    sx={{ minWidth: 0, scrollMarginTop: SCROLL_CLEARANCE }}
  >
    {head}
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, minWidth: 0 }}>
      {children}
    </Box>
  </Box>
);
