import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import { usePlotBox } from '../KkPourStockCurve/internal/logic/use-plot-box';
import { KkPourStockTick } from '../KkPourStockCurve/internal/ui/KkPourStockTick';
import { stockLinesPlotOf, stockLinesTicksOf } from '../pour-stock-lines';
import type { KkPourStockTick as KkPourStockTickModel } from '../pour-stock-trend';
import type { KkPourStockLine, KkPourStockLinesLabels } from '../stock-line';
import { KkPourStockLinesKey } from './internal/ui/KkPourStockLinesKey';
import { KkPourStockLinesSvg } from './internal/ui/KkPourStockLinesSvg';
import { lineTonesPaint } from './internal/ui/line-tones';

const FRAME = { maxForecastDays: 28, headroom: 1.15, maxGlideDays: 6, nowTickGap: 0.24 } as const;
const PLOT = { height: '4.5rem', maxWidth: '26rem', inset: 6, dot: 3, line: 2, ring: 1.5 } as const;
const { light, dark } = kkTokens.color;

const surfaceScheme = {
  light: { '--kk-lines-surface': light.panel2, '--kk-lines-grid': light.line },
  dark: { '--kk-lines-surface': dark.panel2, '--kk-lines-grid': dark.line },
};

const linesPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
  minWidth: 0,
  gap: theme.spacing(0.75),
  ...applyScheme(theme, surfaceScheme),
  ...lineTonesPaint(theme),
  '& [data-lines-plot]': { position: 'relative', height: PLOT.height, pointerEvents: 'none' },
  '& [data-lines-svg]': { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
  '& [data-lines-line]': {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: PLOT.line,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  '& [data-lines-ahead]': {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: PLOT.line - 0.5,
    strokeDasharray: '3 4',
    strokeLinecap: 'round',
    opacity: 0.8,
  },
  '& [data-lines-floor]': { stroke: 'var(--kk-lines-grid)', strokeWidth: 1 },
  '& [data-lines-rule]': {
    stroke: 'var(--kk-lines-grid)',
    strokeWidth: 1,
    strokeDasharray: '2 3',
  },
  '& [data-lines-now]': {
    fill: 'currentColor',
    stroke: 'var(--kk-lines-surface)',
    strokeWidth: PLOT.ring,
  },
  '& [data-lines-empty]': {
    fill: 'var(--kk-lines-surface)',
    stroke: 'currentColor',
    strokeWidth: PLOT.ring,
  },
  '& [data-lines-ticks]': { position: 'relative', marginInline: `${PLOT.inset}px` },
  '& [data-lines-keys]': {
    listStyle: 'none',
    m: 0,
    p: 0,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.25),
  },
});

const FROM_TICK: KkPourStockTickModel = { kind: 'from', share: 0, align: 'start' };

interface KkPourStockLinesProps {
  lines: readonly KkPourStockLine[];
  labels: KkPourStockLinesLabels;
  sx?: KkSx;
}

export const KkPourStockLines: FC<KkPourStockLinesProps> = ({ lines, labels, sx }) => {
  const box = usePlotBox();
  const keys = lines.map((line) => line.key);
  const plot =
    box.size === null ? null : stockLinesPlotOf(lines, { ...box.size, inset: PLOT.inset }, FRAME);
  const svg =
    box.size === null || plot === null ? null : (
      <KkPourStockLinesSvg
        plot={plot}
        keys={keys}
        width={box.size.width}
        height={box.size.height}
        dot={PLOT.dot}
      />
    );
  const ticks = stockLinesTicksOf(lines, FRAME);
  const nowTickModel: KkPourStockTickModel = {
    kind: 'now',
    share: ticks.nowShare,
    align: ticks.nowShare === 1 ? 'end' : 'center',
  };
  const nowTick = ticks.showNow ? <KkPourStockTick tick={nowTickModel} label={labels.now} /> : null;
  const sxList = Array.isArray(sx) ? sx : [sx];
  const rows = lines.map((line, index) => (
    <KkPourStockLinesKey key={line.key} line={line} index={index} />
  ));

  return (
    <Stack data-kk-pour-stock-lines sx={[linesPaint, ...sxList]}>
      <Box aria-hidden>
        <Box ref={box.ref} data-lines-plot>
          {svg}
        </Box>
        <Box data-lines-ticks>
          <KkPourStockTick tick={FROM_TICK} label={labels.from} />
          {nowTick}
        </Box>
      </Box>
      <Box component="ul" data-lines-keys>
        {rows}
      </Box>
    </Stack>
  );
};
