import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';
import { TRAINING_WIDE } from '../training-query';

const SIDE = 'clamp(18rem, 38cqw, 32rem)';
const FULL_HEIGHT = `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`;
const WIDE_COLUMNS = `minmax(0, 1fr) ${SIDE}`;

interface KkTrainingViewRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkTrainingViewRoot: FC<KkTrainingViewRootProps> = ({ label, sx, children }) => {
  const callerSx = Array.isArray(sx) ? sx : [sx];

  return (
    <Box
      component="section"
      aria-label={label}
      data-kk-training
      sx={[
        {
          width: '100%',
          maxWidth: { desktop: '86rem' },
          minWidth: 0,
          height: FULL_HEIGHT,
          mx: 'auto',
          containerType: 'size',
          containerName: 'kk-training',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation',
        },
        ...callerSx,
      ]}
    >
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateAreas: '"head" "count" "gaps" "stage" "controls"',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto',
          rowGap: { xs: 1.5, desktop: 2 },
          columnGap: { xs: 2, desktop: 4 },
          [TRAINING_WIDE]: {
            gridTemplateAreas: '"stage head" "stage count" "stage gaps" "stage controls"',
            gridTemplateColumns: WIDE_COLUMNS,
            gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
