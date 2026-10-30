import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { kkTokens } from './tokens';

const VIEW = 20;
const CENTER = VIEW / 2;
const RADIUS = 8;
const STROKE = 3;
const FULL_TURN = 360;
const GAP_DEGREES = 14;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const arcOf = (from: number, to: number): string => {
  const point = (degrees: number): string => {
    const radians = ((degrees - FULL_TURN / 4) * Math.PI) / (FULL_TURN / 2);
    return `${CENTER + RADIUS * Math.cos(radians)} ${CENTER + RADIUS * Math.sin(radians)}`;
  };
  const large = to - from > FULL_TURN / 2 ? 1 : 0;

  return `M ${point(from)} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${point(to)}`;
};

interface KkLaneProgressProps {
  done: number;
  total: number;
  text: string;
  label: string;
  expanded: boolean;
  onPress: () => void;
}

export const KkLaneProgress: FC<KkLaneProgressProps> = ({
  done,
  total,
  text,
  label,
  expanded,
  onPress,
}) => {
  const slice = total <= 0 ? FULL_TURN : FULL_TURN / total;
  const arcs = Array.from({ length: Math.max(total, 0) }, (_, index) => (
    <Box
      key={index}
      component="path"
      d={arcOf(index * slice + GAP_DEGREES / 2, (index + 1) * slice - GAP_DEGREES / 2)}
      data-done={index < done}
      sx={{
        fill: 'none',
        strokeWidth: STROKE,
        strokeLinecap: 'round',
        stroke: 'currentColor',
        opacity: 0.28,
        '&[data-done="true"]': { opacity: 1 },
      }}
    />
  ));

  return (
    <ButtonBase
      aria-label={label}
      aria-expanded={expanded}
      onClick={onPress}
      data-kk-lane-progress
      sx={(theme) => ({
        flexShrink: 0,
        gap: 0.75,
        minHeight: kkTokens.tapTarget,
        px: 1.25,
        borderRadius: `${kkTokens.radius.pill}px`,
        color: expanded ? palette(theme).background.paper : palette(theme).text.primary,
        backgroundColor: expanded ? palette(theme).text.primary : 'transparent',
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        ...focusRing(theme),
      })}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        aria-hidden
        sx={{
          width: '1.25rem',
          height: '1.25rem',
        }}
      >
        {arcs}
      </Box>
      <Typography
        component="span"
        variant="caption"
        sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
      >
        {text}
      </Typography>
    </ButtonBase>
  );
};
