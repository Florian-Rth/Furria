import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkHallGlyph } from './hall-glyphs';
import { HALL_GLYPHS } from './hall-glyphs';

const padPaint =
  (playing: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      alignItems: 'center',
      justifyItems: 'start',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      textAlign: 'start',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette.background.paper,
      boxShadow: `inset ${kkTokens.line.page * 2}px 0 0 ${playing ? palette.primary.main : palette.divider}`,
      transition: `box-shadow 160ms ease-out, ${kkTokens.motion.press}`,
      '&:active': { transform: 'scale(0.985)' },
      '& [data-kk-hall-pad-glyph]': {
        display: 'grid',
        placeItems: 'center',
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '50%',
        backgroundColor: palette.primary.main,
        color: palette.primary.contrastText,
      },
      ...focusRing(theme),
    };
  };

interface KkHallPadProps extends PropsWithChildren {
  label: string;
  playing: boolean;
  disabled: boolean;
  onPress: () => void;
}

export const KkHallPad: FC<KkHallPadProps> = ({ label, playing, disabled, onPress, children }) => {
  const glyph: KkHallGlyph = playing ? 'pause' : 'play';

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled}
      onClick={onPress}
      sx={padPaint(playing)}
    >
      <span data-kk-hall-pad-glyph>{HALL_GLYPHS[glyph]}</span>
      {children}
    </ButtonBase>
  );
};
