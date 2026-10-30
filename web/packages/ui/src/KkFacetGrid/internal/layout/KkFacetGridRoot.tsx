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
    direction="row"
    role={label === undefined ? undefined : 'group'}
    aria-label={label}
    data-kk-facet-grid
    sx={[
      { flexWrap: 'wrap', gap: 1.25, alignItems: 'stretch', minWidth: 0 },
      fill && FILLING,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
