import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkScoreEveningsRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkScoreEveningsRoot: FC<KkScoreEveningsRootProps> = ({ label, sx, children }) => (
  <Box
    component="ol"
    aria-label={label}
    data-kk-score-evenings
    sx={[
      {
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: `${kkTokens.line.hair}px`,
        minWidth: 0,
        bgcolor: 'divider',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'clip',
        '& > li': { bgcolor: 'background.paper', minWidth: 0 },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
