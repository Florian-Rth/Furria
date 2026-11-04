import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../../internal/safe-area';
import { applyScheme, schemeFill } from '../../../../internal/scheme-paint';
import type { KkSx } from '../../../../kk-sx';
import { kkTokens } from '../../../../tokens';

const GUTTER = 16;

const thumbPaint = (theme: Theme): CSSObject => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 2,
  gap: 1,
  pt: 1.5,
  pb: safeArea('bottom', GUTTER),
  ...applyScheme(theme, schemeFill(kkTokens.color.light.bg, kkTokens.color.dark.bg)),
});

interface KkPourPageThumbProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkPourPageThumb: FC<KkPourPageThumbProps> = ({ children, sx }) => (
  <Stack sx={[thumbPaint, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Stack>
);
