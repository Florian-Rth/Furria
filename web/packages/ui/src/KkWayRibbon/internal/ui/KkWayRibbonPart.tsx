import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { RIBBON_HEIGHT } from '../logic/ribbon-sizes';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const partPaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: RIBBON_HEIGHT,
    minWidth: kkTokens.tapTarget,
    padding: theme.spacing(0.75, 1),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    color: current ? palette(theme).text.primary : palette(theme).text.secondary,
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 16%, ${palette(theme).background.paper})`
      : 'transparent',
    boxShadow: looped
      ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`
      : `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    transition: 'color 200ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out',
    '&:active': { transform: 'scale(0.96)' },
    ...(looped ? redInk(theme) : {}),
    ...focusRing(theme),
  });

interface KkWayRibbonPartProps {
  name: string;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
}

export const KkWayRibbonPart: FC<KkWayRibbonPartProps> = ({
  name,
  label,
  current,
  looped,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={looped}
    data-kk-way-part
    onClick={onPress}
    sx={partPaint(current, looped)}
  >
    <Typography
      component="span"
      variant="overline"
      noWrap
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.2,
        maxWidth: '7rem',
        color: 'inherit',
      }}
    >
      {name}
    </Typography>
    <RepeatRoundedIcon aria-hidden fontSize="small" />
  </ButtonBase>
);
