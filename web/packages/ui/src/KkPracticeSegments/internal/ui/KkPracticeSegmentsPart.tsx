import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const inkOf = (theme: Theme, current: boolean, looped: boolean): string => {
  if (looped) {
    return palette(theme).primary.main;
  }

  return current ? palette(theme).text.primary : palette(theme).text.secondary;
};

const partPaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    gap: theme.spacing(0.5),
    height: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    padding: theme.spacing(0, 1),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    color: inkOf(theme, current, looped),
    boxShadow: looped
      ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`
      : 'none',
    transition: 'color 200ms ease-out, box-shadow 200ms ease-out',
    '&:active': { transform: 'scale(0.96)' },
    ...focusRing(theme),
  });

interface KkPracticeSegmentsPartProps {
  name: string;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
}

export const KkPracticeSegmentsPart: FC<KkPracticeSegmentsPartProps> = ({
  name,
  label,
  current,
  looped,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={looped}
    data-kk-practice-part
    onClick={onPress}
    sx={partPaint(current, looped)}
  >
    <RepeatRoundedIcon aria-hidden fontSize="small" />
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ fontWeight: 800, lineHeight: 1.2, maxWidth: '9rem', color: 'inherit' }}
    >
      {name}
    </Typography>
  </ButtonBase>
);
