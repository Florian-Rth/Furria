import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { useId } from 'react';
import { applyScheme } from '../../internal/scheme-paint';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import { stockModelOf, svgIdOf } from '../pour-stock-chart';
import type { KkPourRunwayMarkKind } from '../pour-stock-runway';
import { stockRunwayOf } from '../pour-stock-runway';
import { KkPourStockRunwayMark } from './internal/ui/KkPourStockRunwayMark';
import { KkPourStockRunwayReadout } from './internal/ui/KkPourStockRunwayReadout';
import { KkPourStockRunwaySpark } from './internal/ui/KkPourStockRunwaySpark';
import { KkPourStockRunwayTrack } from './internal/ui/KkPourStockRunwayTrack';

const SPARK_FRAME = { maxForecastDays: 0, headroom: 1.12, nowTickGap: 0 } as const;
const RUNWAY_FRAME = { scaleDays: 28, edgeShare: 0.12, scaleRoom: 0.3, nowRoom: 0.28 } as const;
const PLOT = { spark: '3rem', maxWidth: '26rem', dot: 3.5, ring: 2, line: 2 } as const;
const MAX_GLIDE_DAYS = 6;
const INSET = PLOT.dot + PLOT.ring;
const { light, dark } = kkTokens.color;

const inkScheme = (warn: boolean) => ({
  light: {
    '--kk-runway-ink': light.ink,
    '--kk-runway-fill': warn ? light.gold : light.ink,
    '--kk-runway-mark': warn ? light.goldInk : light.ink,
    '--kk-runway-track': light.line2,
    '--kk-runway-surface': light.panel2,
    '--kk-runway-fade': 0.16,
  },
  dark: {
    '--kk-runway-ink': dark.ink,
    '--kk-runway-fill': warn ? dark.gold : dark.ink,
    '--kk-runway-mark': warn ? dark.goldInk : dark.ink,
    '--kk-runway-track': dark.line2,
    '--kk-runway-surface': dark.panel2,
    '--kk-runway-fade': 0.24,
  },
});

const runwayPaint =
  (warn: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: { maxWidth: PLOT.maxWidth },
    minWidth: 0,
    gap: theme.spacing(1),
    pointerEvents: 'none',
    ...applyScheme(theme, inkScheme(warn)),
    '& [data-runway-spark]': { position: 'relative', flex: 1, minWidth: 0, height: PLOT.spark },
    '& [data-runway-svg]': { position: 'absolute', inset: 0, display: 'block' },
    '& [data-runway-fade] stop': { stopColor: 'var(--kk-runway-ink)' },
    '& [data-runway-fade] stop:first-of-type': { stopOpacity: 'var(--kk-runway-fade)' },
    '& [data-runway-fade] stop:last-of-type': { stopOpacity: 0 },
    '& [data-runway-line]': {
      fill: 'none',
      stroke: 'var(--kk-runway-ink)',
      strokeWidth: PLOT.line,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    '& [data-runway-now]': {
      fill: 'var(--kk-runway-ink)',
      stroke: 'var(--kk-runway-surface)',
      strokeWidth: PLOT.ring,
    },
    '& [data-runway-track]': {
      position: 'relative',
      height: theme.spacing(1),
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: 'var(--kk-runway-track)',
    },
    '& [data-runway-fill]': {
      position: 'absolute',
      insetBlock: 0,
      left: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundImage:
        'linear-gradient(90deg, var(--kk-runway-fill), color-mix(in srgb, var(--kk-runway-fill) 55%, transparent))',
    },
    '& [data-runway-fill][data-reach="beyond"]': {
      maskImage: 'linear-gradient(90deg, var(--kk-runway-fill) 70%, transparent)',
    },
    '& [data-runway-notch]': {
      position: 'absolute',
      insetBlock: 0,
      width: theme.spacing(0.25),
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--kk-runway-surface)',
    },
    '& [data-runway-marker]': {
      position: 'absolute',
      top: '50%',
      width: theme.spacing(1.75),
      height: theme.spacing(1.75),
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      backgroundColor: 'var(--kk-runway-surface)',
      borderWidth: theme.spacing(0.375),
      borderStyle: 'solid',
      borderColor: 'var(--kk-runway-mark)',
    },
    '& [data-runway-marks]': {
      position: 'relative',
      minHeight: theme.spacing(2),
      marginTop: theme.spacing(-0.25),
    },
  });

interface KkPourStockRunwayProps {
  values: readonly number[];
  forecastDays: number | null;
  warn: boolean;
  readout: { value: string; unit: string };
  labels: Readonly<Record<KkPourRunwayMarkKind, string | null>>;
  sx?: KkSx;
}

export const KkPourStockRunway: FC<KkPourStockRunwayProps> = ({
  values,
  forecastDays,
  warn,
  readout,
  labels,
  sx,
}) => {
  const svgId = svgIdOf(useId());
  const model = stockModelOf(values, null, SPARK_FRAME);
  const runway = stockRunwayOf(model.now.stock, forecastDays, RUNWAY_FRAME);
  const marks = runway.marks.flatMap((mark) => {
    const label = labels[mark.kind];

    return label === null
      ? []
      : [<KkPourStockRunwayMark key={mark.kind} mark={mark} label={label} />];
  });

  return (
    <Stack
      aria-hidden
      data-kk-pour-stock-runway
      sx={[runwayPaint(warn), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-end', gap: 1.5, minWidth: 0 }}>
        <KkPourStockRunwayReadout value={readout.value} unit={readout.unit} warn={warn} />
        <KkPourStockRunwaySpark
          model={model}
          svgId={svgId}
          inset={INSET}
          dot={PLOT.dot}
          maxGlideDays={MAX_GLIDE_DAYS}
        />
      </Stack>
      <KkPourStockRunwayTrack runway={runway} />
      <Box data-runway-marks>{marks}</Box>
    </Stack>
  );
};
