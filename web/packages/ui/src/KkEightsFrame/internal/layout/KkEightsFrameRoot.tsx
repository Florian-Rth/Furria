import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

const WIDE = '@media (min-width: 52.5rem)';
const SIDE = 'clamp(19rem, 36%, 30rem)';

interface KkEightsFrameRootProps extends PropsWithChildren {
  label: string;
  single?: boolean;
}

export const KkEightsFrameRoot: FC<KkEightsFrameRootProps> = ({
  label,
  single = false,
  children,
}) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-eights-frame
    data-single={single}
    sx={{
      width: '100%',
      maxWidth: { desktop: '100rem' },
      minWidth: 0,
      mx: 'auto',
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      display: 'grid',
      gridTemplateAreas: '"band" "bar" "main" "foot"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      rowGap: 1,
      columnGap: 2,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      [WIDE]: {
        gridTemplateAreas: '"band band" "bar bar" "main side" "foot side"',
        gridTemplateColumns: `minmax(0, 1fr) ${SIDE}`,
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
        rowGap: 1.5,
        '&[data-single="true"]': {
          gridTemplateAreas: '"band" "bar" "main" "foot"',
          gridTemplateColumns: 'minmax(0, 1fr)',
        },
      },
    }}
  >
    {children}
  </Box>
);
