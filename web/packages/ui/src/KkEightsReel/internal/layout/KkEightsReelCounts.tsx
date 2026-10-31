import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkEightsReelCountsProps extends PropsWithChildren {
  label: string;
}

export const KkEightsReelCounts: FC<KkEightsReelCountsProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    sx={{
      flexShrink: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
      gridAutoRows: kkTokens.tapTarget,
      gap: 0.25,
      maxHeight: `calc(2 * ${kkTokens.tapTarget} + 0.125rem)`,
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}
  >
    {children}
  </Box>
);
