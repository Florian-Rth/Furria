import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

export type KkFacetReach = 'tile' | 'wide' | 'full';

const BASES: Record<KkFacetReach, string> = {
  tile: '10rem',
  wide: '22rem',
  full: '100%',
};

interface KkFacetGridCellProps extends PropsWithChildren {
  reach: KkFacetReach;
  sx?: KkSx;
}

export const KkFacetGridCell: FC<KkFacetGridCellProps> = ({ reach, sx, children }) => (
  <Stack
    component="li"
    data-kk-facet-cell
    sx={[{ flex: `1 1 ${BASES[reach]}`, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
