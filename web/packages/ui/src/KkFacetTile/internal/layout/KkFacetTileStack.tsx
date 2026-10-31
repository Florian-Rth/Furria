import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkFacetTileStackProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkFacetTileStack: FC<KkFacetTileStackProps> = ({ sx, children }) => (
  <Stack data-kk-facet-stack sx={[{ minWidth: 0, gap: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);
