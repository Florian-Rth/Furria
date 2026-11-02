import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import type { KkSx } from '../../../kk-sx';

const WEEK_DAYS = 7;

interface KkWeekRhythmRootProps {
  label: string;
  days: ReactNode;
  sx?: KkSx;
}

export const KkWeekRhythmRoot: FC<KkWeekRhythmRootProps> = ({ label, days, sx }) => (
  <Box
    component="ol"
    aria-label={label}
    data-kk-week-rhythm
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: `repeat(${WEEK_DAYS}, minmax(0, 1fr))`,
        gap: 0.5,
        minWidth: 0,
        m: 0,
        p: 0,
        listStyle: 'none',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {days}
  </Box>
);
