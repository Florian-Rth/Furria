import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const FILLING = { flex: 1, alignContent: 'stretch' } as const;

interface KkFacetGridRootProps extends PropsWithChildren {
  label?: string;
  fill?: boolean;
  sx?: KkSx;
}

export const KkFacetGridRoot: FC<KkFacetGridRootProps> = ({
  label,
  fill = false,
  sx,
  children,
}) => (
  <Stack
    component="ul"
    role="list"
    direction="row"
    aria-label={label}
    data-kk-facet-grid
    sx={[
      {
        flexWrap: 'wrap',
        gap: 1.25,
        alignItems: 'stretch',
        minWidth: 0,
        m: 0,
        p: 0,
        listStyle: 'none',
      },
      fill && FILLING,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
