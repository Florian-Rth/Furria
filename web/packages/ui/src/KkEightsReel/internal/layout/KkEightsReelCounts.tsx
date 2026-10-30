import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

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
      gridAutoRows: '2.25rem',
      gap: 0.25,
      maxHeight: '4.75rem',
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}
  >
    {children}
  </Box>
);
