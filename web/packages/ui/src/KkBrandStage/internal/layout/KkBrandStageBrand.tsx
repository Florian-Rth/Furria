import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkBrandStageBrandProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkBrandStageBrand: FC<KkBrandStageBrandProps> = ({ sx, children }) => (
  <Stack
    data-kk-brand-stage-brand
    sx={[
      {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        py: 4,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
