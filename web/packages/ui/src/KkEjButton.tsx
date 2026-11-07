import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ejFocusRing } from './internal/ej-focus-ring';
import { redInk } from './internal/red-ink';
import type { KkEjGlyphName } from './KkEjGlyph';
import { KkEjGlyph } from './KkEjGlyph';
import { kkTokens } from './tokens';

export type KkEjButtonTone = 'quiet' | 'ink' | 'accent' | 'danger';

const DISABLED_OPACITY = 0.38;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const tonePaints: Record<KkEjButtonTone, (theme: Theme) => CSSObject> = {
  quiet: (theme) => ({
    color: palette(theme).text.primary,
    backgroundColor: 'transparent',
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
    },
  }),
  ink: (theme) => ({
    color: palette(theme).background.paper,
    backgroundColor: palette(theme).text.primary,
    '&:hover': {
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 86%, transparent)`,
    },
  }),
  accent: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
  }),
  danger: (theme) => ({
    ...redInk(theme),
    backgroundColor: 'transparent',
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).error.main} 45%, transparent)`,
  }),
};

const pressedPaint = (theme: Theme): CSSObject => ({
  color: palette(theme).background.paper,
  backgroundColor: palette(theme).text.primary,
  boxShadow: 'none',
  '&:hover': { backgroundColor: palette(theme).text.primary },
});

interface KkEjButtonProps {
  text: string;
  glyph?: KkEjGlyphName;
  label?: string;
  tone?: KkEjButtonTone;
  pressed?: boolean;
  disabled?: boolean;
  textShown?: boolean;
  onPress: () => void;
}

export const KkEjButton: FC<KkEjButtonProps> = ({
  text,
  glyph,
  label,
  tone = 'quiet',
  pressed,
  disabled = false,
  textShown = true,
  onPress,
}) => {
  const icon = glyph === undefined ? null : <KkEjGlyph name={glyph} />;
  const caption = textShown ? (
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap', color: 'inherit' }}
    >
      {text}
    </Typography>
  ) : null;

  return (
    <ButtonBase
      aria-label={textShown && label === undefined ? undefined : (label ?? text)}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onPress}
      data-kk-ej-button={tone}
      sx={(theme) => ({
        flexShrink: 0,
        minHeight: kkTokens.tapTarget,
        minWidth: kkTokens.tapTarget,
        gap: 0.5,
        px: textShown ? 1.25 : 0.5,
        borderRadius: `${kkTokens.radius.pill}px`,
        transition: 'background-color 160ms ease-out, color 160ms ease-out',
        ...tonePaints[tone](theme),
        ...(pressed === true ? pressedPaint(theme) : {}),
        '&.Mui-disabled': { opacity: DISABLED_OPACITY },
        ...ejFocusRing(theme),
      })}
    >
      {icon}
      {caption}
    </ButtonBase>
  );
};
