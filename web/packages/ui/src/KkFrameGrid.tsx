import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkFrameGridDensity = 'regular' | 'map';

const { gallery } = kkTokens;
const MAP_FACTOR = 2;

const columnsOf = (density: KkFrameGridDensity): Record<'xs' | 'sm' | 'desktop', string> => {
  const factor = density === 'map' ? MAP_FACTOR : 1;
  return {
    xs: `repeat(${gallery.columns.xs * factor}, minmax(0, 1fr))`,
    sm: `repeat(${gallery.columns.sm * factor}, minmax(0, 1fr))`,
    desktop: `repeat(${gallery.columns.desktop * factor}, minmax(0, 1fr))`,
  };
};

interface KkFrameGridProps extends PropsWithChildren {
  density?: KkFrameGridDensity;
  label?: string;
  sx?: KkSx;
}

export const KkFrameGrid: FC<KkFrameGridProps> = ({ density = 'regular', label, sx, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-frame-grid={density}
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: columnsOf(density),
        gap: `${gallery.gutter}px`,
        backgroundColor: gallery.darkroomEdge,
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 480px',
        '& > *': { minWidth: 0 },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
