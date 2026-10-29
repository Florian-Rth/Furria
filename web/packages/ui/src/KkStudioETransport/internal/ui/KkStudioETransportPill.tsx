import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import SlowMotionVideoRoundedIcon from '@mui/icons-material/SlowMotionVideoRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioETransportPillGlyph = 'loop' | 'video' | 'speed';

const GLYPHS: Record<KkStudioETransportPillGlyph, ReactNode> = {
  loop: <RepeatOneRoundedIcon fontSize="small" />,
  video: <VideocamRoundedIcon fontSize="small" />,
  speed: <SlowMotionVideoRoundedIcon fontSize="small" />,
};

const pillPaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    paddingInline: theme.spacing(1.25),
    borderRadius: `${kkTokens.radius.pill}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: pressed ? 'transparent' : (theme.vars ?? theme).palette.divider,
    ...theme.typography.caption,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    color: (theme.vars ?? theme).palette.text.secondary,
    transition: `${kkTokens.motion.press}, background-color 160ms ease-out, color 160ms ease-out`,
    '&:active': { transform: 'scale(0.96)' },
    ...(pressed ? { ...accentWash(theme), ...redInk(theme) } : {}),
    '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
    [theme.breakpoints.up('desktop')]: {
      ...theme.typography.button,
      gap: theme.spacing(0.75),
      paddingInline: theme.spacing(1.5),
    },
    ...focusRing(theme),
  });

interface KkStudioETransportPillProps {
  glyph: KkStudioETransportPillGlyph;
  text: string;
  label?: string;
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioETransportPill: FC<KkStudioETransportPillProps> = ({
  glyph,
  text,
  label,
  pressed,
  disabled = false,
  onToggle,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onToggle}
    data-kk-studio-e-pill={glyph}
    sx={pillPaint(pressed)}
  >
    {GLYPHS[glyph]}
    {text}
  </ButtonBase>
);
