import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeInk } from '../internal/scheme-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { sparkGeometryOf } from './pour-spark';

const FRAME = { width: 120, height: 34, pad: 3, maxForecastSteps: 14 } as const;
const VIEW_BOX = `0 0 ${FRAME.width} ${FRAME.height}`;

const sparkPaint =
  (warn: boolean) =>
  (theme: Theme): CSSObject => ({
    display: 'block',
    width: '100%',
    maxWidth: '9rem',
    height: 'auto',
    overflow: 'visible',
    color: 'text.primary',
    '& [data-spark-area]': { fill: 'currentColor', opacity: 0.08 },
    '& [data-spark-forecast]': warn
      ? applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk))
      : { color: 'text.secondary' },
  });

interface KkPourSparkProps {
  values: readonly number[];
  forecastSteps: number | null;
  warn: boolean;
  sx?: KkSx;
}

export const KkPourSpark: FC<KkPourSparkProps> = ({ values, forecastSteps, warn, sx }) => {
  const geometry = sparkGeometryOf(values, forecastSteps, FRAME);
  const forecast =
    geometry.forecast === null || geometry.empty === null ? null : (
      <g data-spark-forecast>
        <path
          d={geometry.forecast}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        <circle cx={geometry.empty.x} cy={geometry.empty.y} r={2.5} fill="currentColor" />
      </g>
    );

  return (
    <Box
      component="svg"
      viewBox={VIEW_BOX}
      aria-hidden
      data-kk-pour-spark
      sx={[sparkPaint(warn), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <path data-spark-area d={geometry.area} />
      <path
        d={geometry.history}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {forecast}
      <circle cx={geometry.now.x} cy={geometry.now.y} r={2.5} fill="currentColor" />
    </Box>
  );
};
