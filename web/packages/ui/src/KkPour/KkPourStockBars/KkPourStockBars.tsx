import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import { usePlotBox } from '../KkPourStockChart/internal/logic/use-plot-box';
import { KkPourStockTick } from '../KkPourStockChart/internal/ui/KkPourStockTick';
import { barTicksOf, stockBarsPlotOf } from '../pour-stock-bars';
import type { KkPourStockTickKind } from '../pour-stock-chart';
import { KkPourStockBarLabel } from './internal/ui/KkPourStockBarLabel';
import { KkPourStockBarsSvg } from './internal/ui/KkPourStockBarsSvg';

const FRAME = {
  maxForecastDays: 28,
  headroom: 1,
  maxGap: 2,
  minBar: 1.5,
  stub: 2,
  maxRadius: 2,
  labelGap: 24,
} as const;
const PLOT = { height: '5rem', maxWidth: '26rem', labelRoom: 16, dot: 2.5 } as const;
const NOW_TICK_GAP = 0.24;
const { light, dark } = kkTokens.color;

const inkScheme = (warn: boolean) => ({
  light: {
    '--kk-bars-past': light.faint,
    '--kk-bars-today': light.ink,
    '--kk-bars-delivery': light.blue,
    '--kk-bars-ahead': warn ? light.gold : light.line,
    '--kk-bars-idle': light.line,
    '--kk-bars-empty': warn ? light.goldInk : light.sub,
  },
  dark: {
    '--kk-bars-past': dark.faint,
    '--kk-bars-today': dark.ink,
    '--kk-bars-delivery': dark.blue,
    '--kk-bars-ahead': warn ? dark.gold : dark.line,
    '--kk-bars-idle': dark.line,
    '--kk-bars-empty': warn ? dark.goldInk : dark.sub,
  },
});

const barsPaint =
  (warn: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
    minWidth: 0,
    pointerEvents: 'none',
    ...applyScheme(theme, inkScheme(warn)),
    '& [data-bars-plot]': { position: 'relative', height: PLOT.height },
    '& [data-bars-svg]': { position: 'absolute', inset: 0, display: 'block' },
    '& [data-bar="past"]': { fill: 'var(--kk-bars-past)' },
    '& [data-bar="today"]': { fill: 'var(--kk-bars-today)' },
    '& [data-bar="delivery"]': { fill: 'var(--kk-bars-delivery)' },
    '& [data-bar="ahead"]': { fill: 'var(--kk-bars-ahead)', opacity: warn ? 0.55 : 1 },
    '& [data-bar="idle"]': { fill: 'var(--kk-bars-idle)' },
    '& [data-bars-empty]': { fill: 'var(--kk-bars-empty)' },
    '& [data-bars-ticks]': { position: 'relative', marginTop: theme.spacing(0.5) },
  });

interface KkPourStockBarsProps {
  values: readonly number[];
  deliveries: readonly number[];
  forecastDays: number | null;
  warn: boolean;
  labels: Readonly<Record<KkPourStockTickKind, string | null>>;
  sx?: KkSx;
}

export const KkPourStockBars: FC<KkPourStockBarsProps> = ({
  values,
  deliveries,
  forecastDays,
  warn,
  labels,
  sx,
}) => {
  const box = usePlotBox();
  const plot =
    box.size === null
      ? null
      : stockBarsPlotOf(
          values,
          deliveries,
          forecastDays,
          { ...box.size, top: PLOT.labelRoom },
          FRAME,
        );
  const svg =
    box.size === null || plot === null ? null : (
      <KkPourStockBarsSvg
        plot={plot}
        width={box.size.width}
        height={box.size.height}
        dot={PLOT.dot}
      />
    );
  const deliveryLabels =
    plot === null
      ? null
      : plot.labels.map((label) => <KkPourStockBarLabel key={label.day} label={label} />);
  const ticks =
    plot === null
      ? null
      : barTicksOf(plot, NOW_TICK_GAP).flatMap((tick) => {
          const label = labels[tick.kind];

          return label === null
            ? []
            : [<KkPourStockTick key={tick.kind} tick={tick} label={label} />];
        });

  return (
    <Box
      aria-hidden
      data-kk-pour-stock-bars
      sx={[barsPaint(warn), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box ref={box.ref} data-bars-plot>
        {svg}
        {deliveryLabels}
      </Box>
      <Box data-bars-ticks>{ticks}</Box>
    </Box>
  );
};
