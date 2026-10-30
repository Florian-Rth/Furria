import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const partPaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    paddingInline: theme.spacing(1),
    borderRadius: `${kkTokens.radius.pill}px`,
    color: current ? palette(theme).text.primary : palette(theme).text.secondary,
    boxShadow: looped
      ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`
      : 'none',
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 12%, transparent)`
      : 'transparent',
    transition: 'color 200ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out',
    '&:active': { transform: 'scale(0.96)' },
    ...(looped ? redInk(theme) : {}),
    ...focusRing(theme),
  });

interface KkLessonRailPartProps {
  name: string;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
}

export const KkLessonRailPart: FC<KkLessonRailPartProps> = ({
  name,
  label,
  current,
  looped,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={looped}
    onClick={onPress}
    data-kk-lesson-rail-part
    sx={partPaint(current, looped)}
  >
    <RepeatRoundedIcon aria-hidden fontSize="small" />
    <Typography
      component="span"
      variant="overline"
      noWrap
      sx={{
        ...kkTokens.eyebrow,
        lineHeight: 1,
        maxWidth: '8rem',
        color: 'inherit',
      }}
    >
      {name}
    </Typography>
  </ButtonBase>
);
