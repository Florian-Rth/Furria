import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';
import {
  STUDIO_G_CONTAINER,
  STUDIO_G_LANDSCAPE,
  STUDIO_G_WIDE,
} from '../logic/studio-g-desk-queries';

const DOCK = 'clamp(7.25rem, 21cqh, 11.5rem)';
const PANE = 'clamp(19rem, 24cqw, 23rem)';

interface KkStudioGDeskRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioGDeskRoot: FC<KkStudioGDeskRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-studio-g
    sx={[
      {
        width: '100%',
        maxWidth: { desktop: '96rem' },
        minWidth: 0,
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        mx: 'auto',
        containerType: 'size',
        containerName: STUDIO_G_CONTAINER,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"viewer" "transport" "timeline" "inspector"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: `minmax(0, 1fr) auto auto ${DOCK}`,
        rowGap: 1,
        columnGap: 2,
        [STUDIO_G_LANDSCAPE]: {
          gridTemplateAreas: '"viewer transport" "viewer timeline" "viewer inspector"',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
          gridTemplateRows: 'auto auto minmax(0, 1fr)',
        },
        [STUDIO_G_WIDE]: {
          gridTemplateAreas: '"viewer inspector" "transport inspector" "timeline inspector"',
          gridTemplateColumns: `minmax(0, 1fr) ${PANE}`,
          gridTemplateRows: 'minmax(0, 1fr) auto auto',
          rowGap: 1.5,
          columnGap: 2.5,
        },
      }}
    >
      {children}
    </Box>
  </Box>
);
