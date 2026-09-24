import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { applyScheme, schemeInk } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';

export type SplitFlapGlyphTone = 'ink' | 'inverse';

const { light, dark } = kkTokens.color;

const GLYPH_FRAME: CSSObject = {
  position: 'relative',
  display: 'block',
  typography: 'h4',
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.2,
  textAlign: 'center',
  whiteSpace: 'pre',
};

const glyphPaints: Record<SplitFlapGlyphTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ ...GLYPH_FRAME, color: 'text.primary' }),
  inverse: (theme) => ({
    ...GLYPH_FRAME,
    ...applyScheme(theme, schemeInk(light.panel2, dark.bg)),
  }),
};

interface SplitFlapGlyphProps extends PropsWithChildren {
  tone?: SplitFlapGlyphTone;
}

export const SplitFlapGlyph: FC<SplitFlapGlyphProps> = ({ tone = 'ink', children }) => (
  <Typography component="span" sx={glyphPaints[tone]}>
    {children}
  </Typography>
);
