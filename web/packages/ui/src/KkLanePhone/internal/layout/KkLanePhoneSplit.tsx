import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { LANE_PHONE_WIDE } from '../lane-phone-query';

export type KkLanePhoneSplitKind = 'strip' | 'film';

const ROWS: Record<KkLanePhoneSplitKind, string> = {
  strip: 'clamp(13rem, 36%, 17rem) minmax(0, 1fr)',
  film: 'auto minmax(0, 1fr)',
};

const SIDE_COLUMN = 'clamp(20rem, 34cqw, 26rem)';

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
      [LANE_PHONE_WIDE]: {
        gridTemplateColumns: `minmax(0, 1fr) ${SIDE_COLUMN}`,
        gridTemplateRows: 'minmax(0, 1fr)',
      },
    }}
  >
    {children}
  </Box>
);
