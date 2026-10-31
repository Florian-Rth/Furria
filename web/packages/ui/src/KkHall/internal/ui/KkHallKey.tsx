import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { HALL_CRAMPED_NARROW, HALL_CRAMPED_WIDE, HALL_NARROW } from '../hall-query';
import type { KkHallGlyph } from './hall-glyphs';
import { HALL_GLYPHS } from './hall-glyphs';

const KEY_MIN = '3.5rem';
const CAPTION_HIDDEN: CSSObject = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

const keyPaint =
  (strong: boolean, pressed: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;
    const lit = strong || pressed;

    return {
      width: '100%',
      height: '100%',
      minWidth: KEY_MIN,
      minHeight: KEY_MIN,
      flexDirection: 'column',
      gap: theme.spacing(0.25),
      padding: theme.spacing(0.75, 1),
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: strong ? palette.primary.main : palette.background.paper,
      color: lit
        ? strong
          ? palette.primary.contrastText
          : palette.primary.main
        : palette.text.primary,
      boxShadow:
        pressed && !strong
          ? `inset 0 0 0 ${kkTokens.line.section}px ${palette.primary.main}`
          : 'none',
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.96)' },
      '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed, color: palette.text.disabled },
      [HALL_NARROW]: {
        minWidth: kkTokens.tapTarget,
        padding: theme.spacing(0.75, 0.5),
        '& [data-kk-hall-caption]': CAPTION_HIDDEN,
      },
      [HALL_CRAMPED_NARROW]: { minHeight: kkTokens.tapTarget },
      [HALL_CRAMPED_WIDE]: {
        minWidth: kkTokens.tapTarget,
        '& [data-kk-hall-caption]': CAPTION_HIDDEN,
      },
      ...focusRing(theme),
    };
  };

interface KkHallKeyProps {
  glyph: KkHallGlyph;
  caption: string;
  label?: string;
  strong?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkHallKey: FC<KkHallKeyProps> = ({
  glyph,
  caption,
  label,
  strong = false,
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    sx={keyPaint(strong, pressed === true)}
  >
    {HALL_GLYPHS[glyph]}
    <Typography variant="button" component="span" data-kk-hall-caption noWrap>
      {caption}
    </Typography>
  </ButtonBase>
);
