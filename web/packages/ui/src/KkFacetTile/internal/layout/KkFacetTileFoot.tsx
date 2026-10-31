import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkFacetTileFootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkFacetTileFoot: FC<KkFacetTileFootProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-facet-foot
    sx={[
      {
        mt: 'auto',
        pt: 0.5,
        minWidth: 0,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 1,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
