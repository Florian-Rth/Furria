import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';

const INSET_WIDTH = 'clamp(5.5rem, 27cqw, 8rem)';

interface KkStudioGViewerRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioGViewerRoot: FC<KkStudioGViewerRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-g-viewer
    sx={{
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      gridTemplateAreas: '"bar inset" "main main"',
      gridTemplateColumns: `minmax(0, 1fr) ${INSET_WIDTH}`,
      gridTemplateRows: 'auto minmax(0, 1fr)',
      rowGap: 0.75,
      columnGap: 1,
      [STUDIO_G_WIDE]: {
        gridTemplateAreas: '"bar bar" "left right"',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        rowGap: 1.25,
        columnGap: 2,
      },
    }}
  >
    {children}
  </Box>
);
