import Box from '@mui/material/Box';
import type { FC } from 'react';

const VIEW_HEIGHT = 100;
const MIN_BAR = 1.5;
const FILL_SHARE = 0.68;
const REACH = 0.92;

const barPathOf = (values: readonly number[]): string =>
  values
    .map((value, index) => {
      const height = Math.max(MIN_BAR, value * VIEW_HEIGHT * REACH);
      const top = (VIEW_HEIGHT - height) / 2;
      const left = index + (1 - FILL_SHARE) / 2;

      return `M${left} ${top}h${FILL_SHARE}v${height}h${-FILL_SHARE}z`;
    })
    .join('');

interface KkStudioWaveBarsProps {
  values: readonly number[];
}

export const KkStudioWaveBars: FC<KkStudioWaveBarsProps> = ({ values }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox={`0 0 ${Math.max(1, values.length)} ${VIEW_HEIGHT}`}
    preserveAspectRatio="none"
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: '2.75rem',
      width: '100%',
      height: 'calc(100% - 4.75rem)',
      fill: (theme.vars ?? theme).palette.text.primary,
      opacity: 0.5,
      pointerEvents: 'none',
    })}
  >
    <path d={barPathOf(values)} />
  </Box>
);
