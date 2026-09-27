import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { KkBrandStageVariant } from '../brand-stage-variant';

const posterSx = {
  gap: 2,
  pt: 4,
  pb: { desktop: 4 },
};

const bandSx = {
  gap: { xs: 1.25, desktop: 2 },
  pt: { xs: 0.5, desktop: 4 },
  pb: { desktop: 4 },
};

const SHEET_CLEARANCE = { poster: 4, band: 0.5 } as const;

const clearOfTheSheet =
  (variant: KkBrandStageVariant) =>
  (theme: Theme): CSSObject => ({
    [theme.breakpoints.down('desktop')]: {
      bottom: `calc(${theme.spacing(SHEET_CLEARANCE[variant])} + var(--kk-sheet-lift, 0px))`,
    },
  });

interface KkBrandStageBrandProps extends PropsWithChildren {
  variant?: KkBrandStageVariant;
  sx?: KkSx;
}

export const KkBrandStageBrand: FC<KkBrandStageBrandProps> = ({
  variant = 'poster',
  sx,
  children,
}) => (
  <Stack sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
    <Stack
      data-kk-brand-stage-brand
      sx={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'safe center',
          textAlign: 'center',
        },
        variant === 'band' ? bandSx : posterSx,
        clearOfTheSheet(variant),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  </Stack>
);
