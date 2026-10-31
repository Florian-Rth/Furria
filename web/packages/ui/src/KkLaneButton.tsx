import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { redInk } from './internal/red-ink';
import type { KkLaneGlyphName } from './KkLaneGlyph';
import { KkLaneGlyph } from './KkLaneGlyph';
import { kkTokens } from './tokens';

export type KkLaneButtonTone = 'quiet' | 'ink' | 'accent' | 'danger';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const tonePaints: Record<KkLaneButtonTone, (theme: Theme) => CSSObject> = {
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
  }),
  accent: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
  }),
  danger: (theme) => ({
    ...redInk(theme),
    backgroundColor: 'transparent',
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).error.main} 35%, transparent)`,
  }),
};

const pressedPaint = (theme: Theme): CSSObject => ({
  color: palette(theme).background.paper,
  backgroundColor: palette(theme).text.primary,
  boxShadow: 'none',
  '&:hover': { backgroundColor: palette(theme).text.primary },
});

interface KkLaneButtonProps {
  text: string;
  glyph?: KkLaneGlyphName;
  label?: string;
  tone?: KkLaneButtonTone;
  pressed?: boolean;
  disabled?: boolean;
  textShown?: boolean;
  onPress: () => void;
}

export const KkLaneButton: FC<KkLaneButtonProps> = ({
  text,
  glyph,
  label,
  tone = 'quiet',
  pressed,
  disabled = false,
  textShown = true,
  onPress,
}) => {
  const icon = glyph === undefined ? null : <KkLaneGlyph name={glyph} />;
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
      data-kk-lane-button={tone}
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
        '&.Mui-disabled': { color: palette(theme).text.disabled, boxShadow: 'none' },
        ...focusRing(theme),
      })}
    >
      {icon}
      {caption}
    </ButtonBase>
  );
};
