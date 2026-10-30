import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkFacetListRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkFacetListRoot: FC<KkFacetListRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-facet-list
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
