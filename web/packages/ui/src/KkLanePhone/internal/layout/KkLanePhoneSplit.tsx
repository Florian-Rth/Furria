import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkLanePhoneSplitKind = 'strip' | 'film';

const ROWS: Record<KkLanePhoneSplitKind, string> = {
  strip: 'clamp(7rem, 24%, 12rem) minmax(0, 1fr)',
  film: 'auto auto minmax(0, 1fr)',
};

interface KkLanePhoneSplitProps extends PropsWithChildren {
  kind?: KkLanePhoneSplitKind;
}

export const KkLanePhoneSplit: FC<KkLanePhoneSplitProps> = ({ kind = 'strip', children }) => (
  <Box
    data-kk-lane-phone-split={kind}
    sx={{
      minHeight: 0,
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: ROWS[kind],
      gap: 1,
    }}
  >
    {children}
  </Box>
);
