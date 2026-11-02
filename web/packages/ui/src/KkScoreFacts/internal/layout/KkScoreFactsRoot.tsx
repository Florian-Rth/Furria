import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkScoreFactsRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkScoreFactsRoot: FC<KkScoreFactsRootProps> = ({ label, sx, children }) => (
  <Box
    component="ul"
    aria-label={label}
    data-kk-score-facts
    sx={[
      {
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))',
        gap: `${kkTokens.line.hair}px`,
        minWidth: 0,
        bgcolor: 'divider',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'clip',
        '& > li': { bgcolor: 'background.paper', minWidth: 0 },
        '& > li[data-wide="true"]': { gridColumn: '1 / -1' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
