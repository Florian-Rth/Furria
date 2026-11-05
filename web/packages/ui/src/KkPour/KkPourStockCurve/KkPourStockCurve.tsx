import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { useId } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import { usePlotBox } from '../KkPourStockChart/internal/logic/use-plot-box';
import { KkPourStockTick } from '../KkPourStockChart/internal/ui/KkPourStockTick';
import type { KkPourStockTickKind } from '../pour-stock-chart';
import { stockModelOf, svgIdOf } from '../pour-stock-chart';
import { stockCurvePlotOf } from '../pour-stock-trend';
import { KkPourStockCurveSvg } from './internal/ui/KkPourStockCurveSvg';

const FRAME = { maxForecastDays: 28, headroom: 1.22, nowTickGap: 0.24 } as const;
const PLOT = {
  height: '4.5rem',
  maxWidth: '26rem',
  dot: 4,
  glow: 10,
  ring: 2,
  line: 2.25,
} as const;
const MAX_GLIDE_DAYS = 6;
const INSET = PLOT.glow;
const { light, dark } = kkTokens.color;

const inkScheme = (warn: boolean) => ({
  light: {
    '--kk-curve-ink': light.ink,
    '--kk-curve-ahead': warn ? light.gold : light.ink,
    '--kk-curve-ahead-line': warn ? light.goldInk : light.sub,
    '--kk-curve-surface': light.panel2,
    '--kk-curve-grid': light.line,
    '--kk-curve-fade-top': 0.26,
    '--kk-curve-fade-mid': 0.07,
    '--kk-curve-band': warn ? 0.38 : 0.14,
    '--kk-curve-glow': 0.12,
  },
  dark: {
    '--kk-curve-ink': dark.ink,
    '--kk-curve-ahead': warn ? dark.gold : dark.ink,
    '--kk-curve-ahead-line': warn ? dark.goldInk : dark.sub,
    '--kk-curve-surface': dark.panel2,
    '--kk-curve-grid': dark.line,
    '--kk-curve-fade-top': 0.3,
    '--kk-curve-fade-mid': 0.1,
    '--kk-curve-band': warn ? 0.3 : 0.12,
    '--kk-curve-glow': 0.18,
  },
});

const curvePaint =
  (warn: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
    minWidth: 0,
    pointerEvents: 'none',
    ...applyScheme(theme, inkScheme(warn)),
    '& [data-curve-plot]': { position: 'relative', height: PLOT.height },
    '& [data-curve-svg]': { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
    '& [data-curve-area-fade] stop': { stopColor: 'var(--kk-curve-ink)' },
    '& [data-curve-area-fade] stop:nth-of-type(1)': { stopOpacity: 'var(--kk-curve-fade-top)' },
    '& [data-curve-area-fade] stop:nth-of-type(2)': { stopOpacity: 'var(--kk-curve-fade-mid)' },
    '& [data-curve-area-fade] stop:nth-of-type(3)': { stopOpacity: 0 },
    '& [data-curve-band-fade] stop': { stopColor: 'var(--kk-curve-ahead)' },
    '& [data-curve-band-fade] stop:first-of-type': { stopOpacity: 'var(--kk-curve-band)' },
    '& [data-curve-band-fade] stop:last-of-type': { stopOpacity: 0 },
    '& [data-curve-line]': {
      fill: 'none',
      stroke: 'var(--kk-curve-ink)',
      strokeWidth: PLOT.line,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    '& [data-curve-ahead]': {
      fill: 'none',
      stroke: 'var(--kk-curve-ahead-line)',
      strokeWidth: PLOT.line - 0.75,
      strokeDasharray: '3 4',
      strokeLinecap: 'round',
    },
    '& [data-curve-floor]': { stroke: 'var(--kk-curve-grid)', strokeWidth: 1 },
    '& [data-curve-rule]': {
      stroke: 'var(--kk-curve-grid)',
      strokeWidth: 1,
      strokeDasharray: '2 3',
    },
    '& [data-curve-glow]': { fill: 'var(--kk-curve-ink)', opacity: 'var(--kk-curve-glow)' },
    '& [data-curve-now]': {
      fill: 'var(--kk-curve-ink)',
      stroke: 'var(--kk-curve-surface)',
      strokeWidth: PLOT.ring,
    },
    '& [data-curve-empty]': {
      fill: 'var(--kk-curve-surface)',
      stroke: 'var(--kk-curve-ahead-line)',
      strokeWidth: PLOT.ring,
    },
    '& [data-curve-ticks]': {
      position: 'relative',
      marginInline: `${INSET}px`,
      marginTop: theme.spacing(0.25),
    },
  });

interface KkPourStockCurveProps {
  values: readonly number[];
  forecastDays: number | null;
  warn: boolean;
  labels: Readonly<Record<KkPourStockTickKind, string | null>>;
  sx?: KkSx;
}

export const KkPourStockCurve: FC<KkPourStockCurveProps> = ({
  values,
  forecastDays,
  warn,
  labels,
  sx,
}) => {
  const svgId = svgIdOf(useId());
  const box = usePlotBox();
  const model = stockModelOf(values, forecastDays, FRAME);
  const plot =
    box.size === null
      ? null
      : stockCurvePlotOf(model, { ...box.size, inset: INSET }, MAX_GLIDE_DAYS);
  const svg =
    box.size === null || plot === null ? null : (
      <KkPourStockCurveSvg
        plot={plot}
        width={box.size.width}
        height={box.size.height}
        svgId={svgId}
        dot={PLOT.dot}
        glow={PLOT.glow}
      />
    );
  const ticks = model.ticks.flatMap((tick) => {
    const label = labels[tick.kind];

    return label === null ? [] : [<KkPourStockTick key={tick.kind} tick={tick} label={label} />];
  });

  return (
    <Box
      aria-hidden
      data-kk-pour-stock-curve
      sx={[curvePaint(warn), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box ref={box.ref} data-curve-plot>
        {svg}
      </Box>
      <Box data-curve-ticks>{ticks}</Box>
    </Box>
  );
};
