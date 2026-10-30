import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkWayKeysToggleGlyph = 'loopStep' | 'loopPart';

const GLYPHS: Record<KkWayKeysToggleGlyph, ReactNode> = {
  loopStep: <RepeatOneRoundedIcon />,
  loopPart: <RepeatRoundedIcon />,
};

const togglePaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    width: kkTokens.tapTarget,
    height: kkTokens.tapTarget,
    flexShrink: 0,
    borderRadius: `${kkTokens.radius.pill}px`,
    color: (theme.vars ?? theme).palette.text.secondary,
    backgroundColor: pressed
      ? `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} 16%, transparent)`
      : 'transparent',
    transition: `${kkTokens.motion.press}, background-color 200ms ease-out`,
    '&:active': { transform: 'scale(0.9)' },
    '&.Mui-disabled': { color: (theme.vars ?? theme).palette.text.disabled },
    ...(pressed ? redInk(theme) : {}),
    ...focusRing(theme),
  });

interface KkWayKeysToggleProps {
  glyph: KkWayKeysToggleGlyph;
  label: string;
  pressed: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkWayKeysToggle: FC<KkWayKeysToggleProps> = ({
  glyph,
  label,
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    data-kk-way-toggle={glyph}
    sx={togglePaint(pressed)}
  >
    {GLYPHS[glyph]}
  </ButtonBase>
);
