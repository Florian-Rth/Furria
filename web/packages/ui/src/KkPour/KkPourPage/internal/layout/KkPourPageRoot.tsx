import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../../internal/safe-area';
import { applyScheme, schemeFill } from '../../../../internal/scheme-paint';
import type { KkSx } from '../../../../kk-sx';
import { kkTokens } from '../../../../tokens';

const GUTTER = 16;
const PAGE_WIDTH = '30rem';

const rootPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  minHeight: '100dvh',
  width: '100%',
  maxWidth: PAGE_WIDTH,
  mx: 'auto',
  pt: safeArea('top', GUTTER),
  pl: safeArea('left', GUTTER),
  pr: safeArea('right', GUTTER),
  ...applyScheme(theme, schemeFill(kkTokens.color.light.bg, kkTokens.color.dark.bg)),
});

interface KkPourPageRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPourPageRoot: FC<KkPourPageRootProps> = ({ label, children, sx }) => (
  <Stack
    component="main"
    aria-label={label}
    data-kk-pour-page
    sx={[rootPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
