import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import {
  KK_STUDIO_I_SHORT,
  KK_STUDIO_I_WIDE,
  KK_STUDIO_I_WIDE_SHORT,
} from '../../studio-i-editor-query';

const RAIL = 'clamp(13rem, 17cqw, 16rem)';
const SIDE = 'clamp(17rem, 27cqw, 25rem)';

interface KkStudioIEditorRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIEditorRoot: FC<KkStudioIEditorRootProps> = ({ label, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-studio-i
    sx={{
      width: '100%',
      maxWidth: { desktop: '110rem' },
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      mx: 'auto',
      containerType: 'size',
      containerName: 'kk-studio-i kk-practice',
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
        gridTemplateAreas: '"head" "rail" "wave" "frame" "counts" "controls"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto auto',
        rowGap: 1.25,
        columnGap: 3,
        [KK_STUDIO_I_SHORT]: { rowGap: 0.75 },
        [KK_STUDIO_I_WIDE]: {
          gridTemplateAreas:
            '"rail head head" "rail wave wave" "rail frame side" "rail counts side" "rail controls side"',
          gridTemplateColumns: `${RAIL} minmax(0, 1fr) ${SIDE}`,
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
          rowGap: 1.5,
        },
        [KK_STUDIO_I_WIDE_SHORT]: {
          gridTemplateAreas:
            '"rail head head" "rail wave wave" "rail frame side" "rail counts controls"',
          gridTemplateColumns: '11rem minmax(0, 1fr) 15rem',
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
          columnGap: 1.5,
          rowGap: 0.75,
        },
      }}
    >
      {children}
    </Box>
  </Box>
);
