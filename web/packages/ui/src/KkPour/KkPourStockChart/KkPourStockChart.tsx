import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { useId } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import type { KkPourStockTickKind } from '../pour-stock-chart';
import { stockModelOf, stockPlotOf, svgIdOf } from '../pour-stock-chart';
import { usePlotBox } from './internal/logic/use-plot-box';
import { KkPourStockPlotSvg } from './internal/ui/KkPourStockPlotSvg';
import { KkPourStockTick } from './internal/ui/KkPourStockTick';

const FRAME = { maxForecastDays: 28, headroom: 1.18, nowTickGap: 0.24 } as const;
const PLOT = { height: '3.75rem', maxWidth: '26rem', dot: 3.5, ring: 2, line: 2 } as const;
const INSET = PLOT.dot + PLOT.ring;
const { light, dark } = kkTokens.color;

const inkScheme = (warn: boolean) => ({
  light: {
    '--kk-stock-ink': light.ink,
    '--kk-stock-ahead': warn ? light.goldInk : light.sub,
    '--kk-stock-surface': light.panel2,
    '--kk-stock-grid': light.line,
    '--kk-stock-fade': 0.16,
  },
  dark: {
    '--kk-stock-ink': dark.ink,
    '--kk-stock-ahead': warn ? dark.goldInk : dark.sub,
    '--kk-stock-surface': dark.panel2,
    '--kk-stock-grid': dark.line,
    '--kk-stock-fade': 0.22,
  },
});

const chartPaint =
  (warn: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
    minWidth: 0,
    pointerEvents: 'none',
    ...applyScheme(theme, inkScheme(warn)),
    '& [data-stock-plot]': { position: 'relative', height: PLOT.height },
    '& [data-stock-svg]': { position: 'absolute', inset: 0, display: 'block' },
    '& [data-stock-fade] stop': { stopColor: 'var(--kk-stock-ink)' },
    '& [data-stock-fade] stop:first-of-type': { stopOpacity: 'var(--kk-stock-fade)' },
    '& [data-stock-fade] stop:last-of-type': { stopOpacity: 0 },
    '& [data-stock-history]': {
      fill: 'none',
      stroke: 'var(--kk-stock-ink)',
      strokeWidth: PLOT.line,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    '& [data-stock-ahead]': {
      fill: 'none',
      stroke: 'var(--kk-stock-ahead)',
      strokeDasharray: '0.1 5',
      strokeLinecap: 'round',
      strokeWidth: PLOT.line + 0.5,
    },
    '& [data-stock-floor]': { stroke: 'var(--kk-stock-grid)', strokeWidth: 1 },
    '& [data-stock-today]': { stroke: 'var(--kk-stock-grid)', strokeWidth: 1 },
    '& [data-stock-now]': {
      fill: 'var(--kk-stock-ink)',
      stroke: 'var(--kk-stock-surface)',
      strokeWidth: PLOT.ring,
    },
    '& [data-stock-empty]': {
      fill: 'var(--kk-stock-surface)',
      stroke: 'var(--kk-stock-ahead)',
      strokeWidth: PLOT.line,
    },
    '& [data-stock-ticks]': {
      position: 'relative',
      marginInline: `${INSET}px`,
      marginTop: theme.spacing(0.25),
    },
  });

interface KkPourStockChartProps {
  values: readonly number[];
  forecastDays: number | null;
  warn: boolean;
  labels: Readonly<Record<KkPourStockTickKind, string | null>>;
  sx?: KkSx;
}

export const KkPourStockChart: FC<KkPourStockChartProps> = ({
  values,
  forecastDays,
  warn,
  labels,
  sx,
}) => {
  const fadeId = svgIdOf(useId());
  const box = usePlotBox();
  const model = stockModelOf(values, forecastDays, FRAME);
  const plot = box.size === null ? null : stockPlotOf(model, { ...box.size, inset: INSET });
  const svg =
    box.size === null || plot === null ? null : (
      <KkPourStockPlotSvg
        plot={plot}
        width={box.size.width}
        height={box.size.height}
        fadeId={fadeId}
        radius={PLOT.dot}
      />
    );
  const ticks = model.ticks.flatMap((tick) => {
    const label = labels[tick.kind];

    return label === null ? [] : [<KkPourStockTick key={tick.kind} tick={tick} label={label} />];
  });

  return (
    <Box
      aria-hidden
      data-kk-pour-stock-chart
      sx={[chartPaint(warn), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box ref={box.ref} data-stock-plot>
        {svg}
      </Box>
      <Box data-stock-ticks>{ticks}</Box>
    </Box>
  );
};
