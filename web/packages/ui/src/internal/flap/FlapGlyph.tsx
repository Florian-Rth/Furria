import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../tokens';
import { redInk } from '../red-ink';
import { applyScheme, schemeInk } from '../scheme-paint';
import { toneRecipes } from '../tone';

export type FlapGlyphVariant = 'bar' | 'h1' | 'caption';
export type FlapGlyphTone = 'ink' | 'muted' | 'accent' | 'inverse' | 'gold' | 'onGold';

const { light, dark } = kkTokens.color;
const { tracking } = kkTokens.type;
const { gold } = toneRecipes;

const GLYPH_FRAME: CSSObject = {
  position: 'relative',
  display: 'block',
  textAlign: 'center',
  whiteSpace: 'pre',
};

const glyphFaces: Record<FlapGlyphVariant, CSSObject> = {
  bar: { typography: 'h4', letterSpacing: tracking.display, lineHeight: 1.2 },
  h1: {
    typography: 'h1',
    letterSpacing: tracking.display,
    lineHeight: 1.1,
    textTransform: 'uppercase',
  },
  caption: {
    typography: 'caption',
    fontWeight: kkTokens.eyebrow.fontWeight,
    letterSpacing: tracking.tight,
    textTransform: 'uppercase',
    fontVariantNumeric: 'proportional-nums',
  },
};

const glyphInks: Record<FlapGlyphTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ color: 'text.primary' }),
  muted: () => ({ color: 'text.secondary' }),
  accent: redInk,
  inverse: (theme) => applyScheme(theme, schemeInk(light.panel2, dark.bg)),
  gold: (theme) => applyScheme(theme, schemeInk(gold.inkLight, gold.inkDark)),
  onGold: (theme) => applyScheme(theme, schemeInk(light.ink, light.ink)),
};

const glyphPaintOf =
  (variant: FlapGlyphVariant, tone: FlapGlyphTone) =>
  (theme: Theme): CSSObject => ({
    ...GLYPH_FRAME,
    ...glyphFaces[variant],
    ...glyphInks[tone](theme),
  });

interface FlapGlyphProps extends PropsWithChildren {
  variant?: FlapGlyphVariant;
  tone?: FlapGlyphTone;
}

export const FlapGlyph: FC<FlapGlyphProps> = ({ variant = 'bar', tone = 'ink', children }) => {
  const glyphPaint = glyphPaintOf(variant, tone);

  return (
    <Typography component="span" sx={glyphPaint}>
      {children}
    </Typography>
  );
};
