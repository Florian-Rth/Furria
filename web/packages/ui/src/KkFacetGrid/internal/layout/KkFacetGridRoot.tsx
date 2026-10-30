import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkFacetGridRootProps extends PropsWithChildren {
  label?: string;
  sx?: KkSx;
}

export const KkFacetGridRoot: FC<KkFacetGridRootProps> = ({ label, sx, children }) => (
  <Stack
    direction="row"
    aria-label={label}
    data-kk-facet-grid
    sx={[
      { flexWrap: 'wrap', gap: 1.25, alignItems: 'stretch', minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
