import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

const HEIGHT = 100;
const MIDDLE = HEIGHT / 2;
const FLOOR = 0.02;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const outlineOf = (values: readonly number[]): string => {
  if (values.length === 0) {
    return '';
  }
  const top = values.map(
    (value, index) => `${index} ${MIDDLE - Math.max(FLOOR, value) * MIDDLE * 0.92}`,
  );
  const bottom = [...values]
    .map((value, index) => `${index} ${MIDDLE + Math.max(FLOOR, value) * MIDDLE * 0.92}`)
    .reverse();

  return `M ${top.join(' L ')} L ${bottom.join(' L ')} Z`;
};

interface KkLaneTrackWaveProps {
  values: readonly number[];
}

export const KkLaneTrackWave: FC<KkLaneTrackWaveProps> = ({ values }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox={`0 0 ${Math.max(1, values.length - 1)} ${HEIGHT}`}
    preserveAspectRatio="none"
    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
  >
    <Box
      component="path"
      d={outlineOf(values)}
      sx={(theme) => ({
        fill: `color-mix(in srgb, ${palette(theme).text.primary} 30%, transparent)`,
        stroke: 'none',
      })}
    />
  </Box>
);
