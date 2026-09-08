import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const SHEET_LIFT_TRANSFORM = 'translateY(calc(var(--kk-sheet-lift, 0px) / -2))';

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
        transform: { xs: SHEET_LIFT_TRANSFORM, desktop: 'none' },
        willChange: 'transform',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
