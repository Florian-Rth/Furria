import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import { HEUTE_WIDE } from '../heute-layout';

interface HeuteLayoutProps {
  head: ReactNode;
  strip: ReactNode;
  stage: ReactNode;
  call: ReactNode;
  keys: ReactNode;
}

const AREA = { minWidth: 0, minHeight: 0 };
const SCROLL_AREA = { ...AREA, overflowY: 'auto', overscrollBehavior: 'contain' };

export const HeuteLayout: FC<HeuteLayoutProps> = ({ head, strip, stage, call, keys }) => (
  <Box
    sx={{
      gridColumn: '1 / -1',
      gridRow: '1 / -1',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      gap: 1.25,
      gridTemplateAreas: '"head" "strip" "stage" "call" "keys"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto',
      [HEUTE_WIDE]: {
        columnGap: 2,
        gridTemplateAreas: '"head head" "strip strip" "stage call" "stage keys"',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      },
    }}
  >
    <Box sx={{ ...AREA, gridArea: 'head' }}>{head}</Box>
    <Box sx={{ ...AREA, gridArea: 'strip' }}>{strip}</Box>
    <Box
      component="section"
      sx={{
        ...SCROLL_AREA,
        gridArea: 'stage',
        maxHeight: '45cqh',
        [HEUTE_WIDE]: { maxHeight: 'none' },
      }}
    >
      {stage}
    </Box>
    <Box sx={{ ...SCROLL_AREA, gridArea: 'call' }}>{call}</Box>
    <Box sx={{ ...AREA, gridArea: 'keys' }}>{keys}</Box>
  </Box>
);
