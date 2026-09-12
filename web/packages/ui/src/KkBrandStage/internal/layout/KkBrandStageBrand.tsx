import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { KkBrandStageVariant } from '../brand-stage-variant';

const SHEET_LIFT_TRANSFORM = 'translateY(calc(var(--kk-sheet-lift, 0px) / -2))';

const posterSx = {
  flex: 1,
  justifyContent: 'center',
  gap: 2,
  py: 4,
  transform: { xs: SHEET_LIFT_TRANSFORM, desktop: 'none' },
  willChange: 'transform',
};

const bandSx = {
  flex: { xs: '0 0 auto', desktop: 1 },
  justifyContent: { xs: 'flex-start', desktop: 'center' },
  gap: { xs: 1.25, desktop: 2 },
  py: { xs: 0.5, desktop: 4 },
};

interface KkBrandStageBrandProps extends PropsWithChildren {
  variant?: KkBrandStageVariant;
  sx?: KkSx;
}

export const KkBrandStageBrand: FC<KkBrandStageBrandProps> = ({
  variant = 'poster',
  sx,
  children,
}) => (
  <Stack
    data-kk-brand-stage-brand
    sx={[
      { width: '100%', alignItems: 'center', textAlign: 'center' },
      variant === 'band' ? bandSx : posterSx,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
