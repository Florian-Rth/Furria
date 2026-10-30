import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

const VIEW_HEIGHT = 100;
const FILL_SHARE = 0.68;
const FLOOR = 0.04;
const REACH = 0.9;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIWaveBarsProps {
  bars: readonly number[];
  from: number;
  to: number;
}

const barPath = (value: number, index: number): string => {
  const height = Math.max(FLOOR, value) * VIEW_HEIGHT * REACH;
  const top = (VIEW_HEIGHT - height) / 2;
  const left = index + (1 - FILL_SHARE) / 2;

  return `M${left} ${top}h${FILL_SHARE}v${height}h-${FILL_SHARE}z`;
};

export const KkStudioIWaveBars: FC<KkStudioIWaveBarsProps> = ({ bars, from, to }) => {
  const width = Math.max(1, bars.length);
  const isInside = (index: number): boolean => {
    const centre = (index + 0.5) / width;
    return centre >= from && centre <= to;
  };
  const inside = bars
    .map((value, index) => (isInside(index) ? barPath(value, index) : ''))
    .join('');
  const outside = bars
    .map((value, index) => (isInside(index) ? '' : barPath(value, index)))
    .join('');

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: '1.5rem',
        width: '100%',
        height: 'calc(100% - 2.75rem)',
        '& [data-inside="false"]': { fill: palette(theme).text.disabled },
        '& [data-inside="true"]': { fill: palette(theme).text.primary },
      })}
    >
      <path data-inside="false" d={outside} />
      <path data-inside="true" d={inside} />
    </Box>
  );
};
