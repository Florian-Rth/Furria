import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkScoreReadinessRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkScoreReadinessRoot: FC<KkScoreReadinessRootProps> = ({ label, sx, children }) => (
  <Box sx={[{ containerType: 'inline-size', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <Box
      component="ul"
      aria-label={label}
      data-kk-score-readiness
      sx={[
        {
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          '@container (min-width: 26rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
          '@container (min-width: 60rem)': { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
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
      ]}
    >
      {children}
    </Box>
  </Box>
);
