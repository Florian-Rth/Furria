import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';
import { AreaPlot, LinePlot, lineClasses } from '@mui/x-charts/LineChart';
import type { FC } from 'react';
import { useId } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import type { KkPourStockTickKind } from '../pour-stock-chart';
import { stockModelOf, svgIdOf } from '../pour-stock-chart';
import { KkPourStockGuides } from './internal/ui/KkPourStockGuides';
import { KkPourStockPoints } from './internal/ui/KkPourStockPoints';
import { KkPourStockTick } from './internal/ui/KkPourStockTick';

const FRAME = { maxForecastDays: 28, headroom: 1.18, nowTickGap: 0.24 } as const;
const PLOT = { height: '3.75rem', maxWidth: '26rem', dot: 3.5, ring: 2, line: 2 } as const;
const INSET = PLOT.dot + PLOT.ring;
const MARGIN = { top: INSET, right: INSET, bottom: INSET, left: INSET } as const;
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
  (warn: boolean, fadeId: string) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
    minWidth: 0,
    pointerEvents: 'none',
    ...applyScheme(theme, inkScheme(warn)),
    '& [data-stock-plot]': { position: 'relative', height: PLOT.height },
    '& [data-stock-fade] stop': { stopColor: 'var(--kk-stock-ink)' },
    '& [data-stock-fade] stop:first-of-type': { stopOpacity: 'var(--kk-stock-fade)' },
    '& [data-stock-fade] stop:last-of-type': { stopOpacity: 0 },
    [`& .${lineClasses.line}[data-series="history"]`]: {
      stroke: 'var(--kk-stock-ink)',
      strokeLinecap: 'round',
    },
    [`& .${lineClasses.area}[data-series="history"]`]: { fill: `url(#${fadeId})`, filter: 'none' },
    [`& .${lineClasses.line}[data-series="ahead"]`]: {
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
  const model = stockModelOf(values, forecastDays, FRAME);
  const empty = model.emptyReached ? model.end : null;
  const marksToday = model.end !== null;
  const series = [
    {
      type: 'line' as const,
      id: 'history',
      data: model.history,
      curve: 'stepAfter' as const,
      area: true,
      showMark: false,
    },
    {
      type: 'line' as const,
      id: 'ahead',
      data: model.forecast,
      curve: 'linear' as const,
      connectNulls: true,
      showMark: false,
    },
  ];
  const xAxis = [
    {
      id: 'days',
      data: model.days,
      scaleType: 'linear' as const,
      min: 0,
      max: model.days.at(-1) ?? 1,
      position: 'none' as const,
    },
  ];
  const yAxis = [{ id: 'stock', min: 0, max: model.peak, position: 'none' as const }];
  const ticks = model.ticks.flatMap((tick) => {
    const label = labels[tick.kind];

    return label === null ? [] : [<KkPourStockTick key={tick.kind} tick={tick} label={label} />];
  });

  return (
    <Box
      aria-hidden
      data-kk-pour-stock-chart
      sx={[chartPaint(warn, fadeId), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box data-stock-plot>
        <ChartsContainer series={series} xAxis={xAxis} yAxis={yAxis} margin={MARGIN}>
          <defs>
            <linearGradient id={fadeId} data-stock-fade x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" />
              <stop offset="1" />
            </linearGradient>
          </defs>
          <KkPourStockGuides nowDay={model.now.day} marksToday={marksToday} />
          <AreaPlot />
          <LinePlot />
          <KkPourStockPoints now={model.now} empty={empty} radius={PLOT.dot} />
        </ChartsContainer>
      </Box>
      <Box data-stock-ticks>{ticks}</Box>
    </Box>
  );
};
