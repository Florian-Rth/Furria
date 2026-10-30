import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';

const PEEK_WIDTH = '86%';
const DESKTOP_MIN_CARD = '20rem';

const RAIL_FRAME: CSSObject = {
  m: 0,
  p: 0,
  listStyle: 'none',
  minWidth: 0,
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: PEEK_WIDTH,
  gap: 1.5,
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollSnapType: 'x mandatory',
  scrollPaddingInline: 2,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  '& > *': { scrollSnapAlign: 'start', minWidth: 0 },
  '@media (min-width: 900px)': {
    gridAutoFlow: 'row',
    gridAutoColumns: 'auto',
    gridTemplateColumns: `repeat(auto-fill, minmax(${DESKTOP_MIN_CARD}, 1fr))`,
    overflowX: 'visible',
    scrollSnapType: 'none',
  },
};

interface KkPassRailProps extends PropsWithChildren {
  label: string;
  single?: boolean;
  sx?: KkSx;
}

export const KkPassRail: FC<KkPassRailProps> = ({ label, single = false, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-pass-rail
    sx={[RAIL_FRAME, single && { gridAutoColumns: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
