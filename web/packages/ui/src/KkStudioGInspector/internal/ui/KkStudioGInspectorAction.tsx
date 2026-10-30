import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import KeyboardTabRoundedIcon from '@mui/icons-material/KeyboardTabRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkStudioGActionGlyph = 'jump' | 'loop' | 'earlier' | 'later' | 'reset';

const GLYPHS: Record<KkStudioGActionGlyph, ReactNode> = {
  jump: <KeyboardTabRoundedIcon />,
  loop: <RepeatRoundedIcon />,
  earlier: <ArrowBackRoundedIcon />,
  later: <ArrowForwardRoundedIcon />,
  reset: <UndoRoundedIcon />,
};

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioGInspectorActionProps {
  glyph: KkStudioGActionGlyph;
  text: string;
  label?: string;
  pressed?: boolean;
  onPress: () => void;
}

export const KkStudioGInspectorAction: FC<KkStudioGInspectorActionProps> = ({
  glyph,
  text,
  label,
  pressed,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    onClick={onPress}
    data-kk-studio-g-action={glyph}
    sx={(theme) => ({
      gap: 0.5,
      minHeight: '2.25rem',
      px: 1.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: pressed === true ? palette(theme).text.primary : 'transparent',
      color: pressed === true ? palette(theme).background.paper : palette(theme).text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      transition: `${kkTokens.motion.press}, background-color 160ms ease-out`,
      '&:active': { transform: 'scale(0.96)' },
      '& svg': { width: '1rem', height: '1rem' },
      ...focusRing(theme),
    })}
  >
    {GLYPHS[glyph]}
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 800, color: 'inherit', fontVariantNumeric: 'tabular-nums' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
