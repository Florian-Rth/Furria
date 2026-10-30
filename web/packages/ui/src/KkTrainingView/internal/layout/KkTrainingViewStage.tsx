import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { TRAINING_WIDE } from '../training-query';

const BLEED_LEFT = `calc(-1 * ${trackEdgeOf('left')})`;
const BLEED_RIGHT = `calc(-1 * ${trackEdgeOf('right')})`;

export const KkTrainingViewStage: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-training-stage
    sx={{
      gridArea: 'stage',
      display: 'grid',
      placeItems: 'center',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      ml: BLEED_LEFT,
      mr: BLEED_RIGHT,
      [TRAINING_WIDE]: { ml: 0, mr: 0 },
    }}
  >
    {children}
  </Box>
);
