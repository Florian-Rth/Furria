import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { raisedSurfaceScheme } from '../../../internal/raised-surface';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { PASS_INSET, PASS_SECTION_GAP, passAssembly, passHairRule } from '../pass-paint';

const { light, dark } = kkTokens.color;

const rootPaint = (theme: Theme): CSSObject => ({
  minWidth: 0,
  height: '100%',
  px: PASS_INSET,
  py: PASS_SECTION_GAP,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderRadius: `${kkTokens.radius.base}px`,
  ...applyScheme(theme, raisedSurfaceScheme, schemeEdge(light.line, dark.line)),
  '& > * + [data-kk-pass-part]': {
    mt: PASS_SECTION_GAP,
    pt: PASS_SECTION_GAP,
    borderTopWidth: kkTokens.line.hair,
    borderTopStyle: 'solid',
    ...passHairRule(theme),
  },
  ...passAssembly,
});

interface KkPassCardRootProps extends PropsWithChildren {
  label: string;
  component?: ElementType;
  sx?: KkSx;
}

export const KkPassCardRoot: FC<KkPassCardRootProps> = ({
  label,
  component = 'article',
  sx,
  children,
}) => (
  <Stack
    component={component}
    aria-label={label}
    data-kk-pass-card
    sx={[rootPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
