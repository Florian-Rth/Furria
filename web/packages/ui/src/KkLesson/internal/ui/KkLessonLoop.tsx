import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { LESSON_NARROW } from '../lesson-query';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const loopPaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    paddingInline: theme.spacing(1.25),
    borderRadius: `${kkTokens.radius.pill}px`,
    color: palette(theme).text.secondary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    transition: `${kkTokens.motion.press}, box-shadow 160ms ease-out, background-color 160ms ease-out`,
    '&:active': { transform: 'scale(0.95)' },
    ...(pressed
      ? {
          ...redInk(theme),
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 12%, transparent)`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
        }
      : {}),
    [LESSON_NARROW]: { paddingInline: 0, '& [data-kk-lesson-loop-text]': { display: 'none' } },
    ...focusRing(theme),
  });

interface KkLessonLoopProps {
  text: string;
  label: string;
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkLessonLoop: FC<KkLessonLoopProps> = ({
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
    data-kk-lesson-loop
    sx={loopPaint(pressed)}
  >
    <RepeatOneRoundedIcon aria-hidden fontSize="small" />
    <Typography
      component="span"
      variant="caption"
      data-kk-lesson-loop-text
      sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit', whiteSpace: 'nowrap' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
