import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkMetalGradient } from '../honour-laps';
import type { MetalStop } from '../honour-paint';
import { metalStopPaint } from '../honour-paint';

interface GradientStop {
  offset: number;
  stop: MetalStop;
}

const STOPS: readonly GradientStop[] = [
  { offset: 0, stop: 'highlight' },
  { offset: 0.38, stop: 'mid' },
  { offset: 0.72, stop: 'shadow' },
  { offset: 1, stop: 'mid' },
];

interface KkHonourMetalGradientProps {
  id: string;
  gradient: KkMetalGradient;
}

export const KkHonourMetalGradient: FC<KkHonourMetalGradientProps> = ({ id, gradient }) => {
  const stops = STOPS.map(({ offset, stop }) => {
    const paint = metalStopPaint(gradient, stop);

    return <Box key={offset} component="stop" offset={offset} sx={paint} />;
  });

  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      {stops}
    </linearGradient>
  );
};
