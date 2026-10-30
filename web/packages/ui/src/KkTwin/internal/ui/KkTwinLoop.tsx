import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkTwinLoopKind = 'off' | 'step' | 'part';

const GLYPHS: Record<KkTwinLoopKind, ReactNode> = {
  off: <RepeatRoundedIcon fontSize="small" />,
  step: <RepeatOneRoundedIcon fontSize="small" />,
  part: <RepeatRoundedIcon fontSize="small" />,
};

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const loopPaint =
  (kind: KkTwinLoopKind) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: 0.5,
    width: '5.5rem',
    height: kkTokens.tapTarget,
    borderRadius: `${kkTokens.radius.pill}px`,
    color: palette(theme).text.secondary,
    transition: `${kkTokens.motion.press}, background-color 160ms ease-out`,
    '&:active': { transform: 'scale(0.95)' },
    ...(kind === 'off'
      ? {}
      : {
          ...redInk(theme),
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
        }),
    ...focusRing(theme),
  });

interface KkTwinLoopProps {
  kind: KkTwinLoopKind;
  text: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

export const KkTwinLoop: FC<KkTwinLoopProps> = ({ kind, text, label, disabled, onPress }) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={kind !== 'off'}
    disabled={disabled}
    onClick={onPress}
    data-kk-twin-loop={kind}
    sx={loopPaint(kind)}
  >
    {GLYPHS[kind]}
    <Typography
      component="span"
      variant="subtitle2"
      aria-hidden
      sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
