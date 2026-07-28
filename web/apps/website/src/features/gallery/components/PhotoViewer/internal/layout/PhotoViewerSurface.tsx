import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const PhotoViewerSurface: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-photo-viewer-surface
    sx={{
      display: 'grid',
      height: '100%',
      minHeight: 0,
      px: { xs: 2, desktop: 5 },
      pb: { xs: 2.5, desktop: 3.5 },
      columnGap: { xs: 1, desktop: 3 },
      rowGap: { xs: 1.5, desktop: 2 },
      gridTemplateColumns: { xs: '1fr 1fr', desktop: 'auto minmax(0, 1fr) auto' },
      gridTemplateRows: {
        xs: 'auto minmax(0, 1fr) auto auto',
        desktop: 'auto minmax(0, 1fr) auto',
      },
      gridTemplateAreas: {
        xs: '"header header" "stage stage" "footer footer" "prev next"',
        desktop: '"header header header" "prev stage next" "footer footer footer"',
      },
    }}
  >
    {children}
  </Box>
);
