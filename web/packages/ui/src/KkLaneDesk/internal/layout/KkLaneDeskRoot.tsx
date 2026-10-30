import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

const LANES_ROW = 'fit-content(44cqh)';

interface KkLaneDeskRootProps extends PropsWithChildren {
  label: string;
}

export const KkLaneDeskRoot: FC<KkLaneDeskRootProps> = ({ label, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-lane-desk
    sx={{
      width: '100%',
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      containerType: 'size',
      containerName: 'kk-lane-desk',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}
  >
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"band band" "bar bar" "stage inspector" "lanes lanes"',
        gridTemplateColumns: 'minmax(0, 1fr) clamp(17rem, 32cqw, 24rem)',
        gridTemplateRows: `auto auto minmax(0, 1fr) ${LANES_ROW}`,
        gap: 1,
      }}
    >
      {children}
    </Box>
  </Box>
);
