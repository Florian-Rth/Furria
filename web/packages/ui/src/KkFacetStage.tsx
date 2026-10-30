import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from './KkShell/internal/track-edge';
import type { KkSx } from './kk-sx';

const TRACK_HEIGHT = `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`;

interface KkFacetStageProps extends PropsWithChildren {
  fill: boolean;
  sx?: KkSx;
}

export const KkFacetStage: FC<KkFacetStageProps> = ({ fill, sx, children }) => (
  <Stack
    data-kk-facet-stage
    sx={[
      { gap: 2, minWidth: 0 },
      fill && { minHeight: TRACK_HEIGHT },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
