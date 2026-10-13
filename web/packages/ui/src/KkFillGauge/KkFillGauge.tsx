import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../internal/ink-wash';
import { useReducedMotion } from '../internal/use-reduced-motion';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { fillGaugeSharesOf } from './internal/fill-gauge';
import type { KkFillSwatch } from './internal/fill-gauge-paint';
import { capPaint, swatchPaint } from './internal/fill-gauge-paint';
import type { KkFillGaugeLegendItem } from './internal/KkFillGaugeLegend';
import { KkFillGaugeLegend } from './internal/KkFillGaugeLegend';

const { system } = kkTokens;
const EMPTY = { scaleX: 0 } as const;
const FADED = { opacity: 0 } as const;
const FILLED = { scaleX: 1, opacity: 1 } as const;
const FILL: Transition = { duration: system.fillSeconds, ease: [0.22, 0.61, 0.36, 1] };
const TICK_STEP = '10%';

export interface KkFillGaugePart {
  key: string;
  label: string;
  figure: string;
  bytes: number;
}

export interface KkFillGaugeRest {
  label: string;
  figure: string;
  bytes: number;
}

interface Segment {
  key: string;
  share: number;
  swatch: KkFillSwatch;
}

const percentOf = (share: number): string => `${(share * 100).toFixed(2)}%`;

const ticksPaint = (theme: Theme): CSSObject => ({
  height: system.tickHeight,
  backgroundImage: `linear-gradient(to right, ${inkWash(theme, '34%')} 1px, transparent 1px)`,
  backgroundSize: `${TICK_STEP} 100%`,
  borderRight: `1px solid ${inkWash(theme, '34%')}`,
});

const restItem = (
  key: 'other' | 'free',
  rest: KkFillGaugeRest | null,
): KkFillGaugeLegendItem[] =>
  rest === null ? [] : [{ key, label: rest.label, figure: rest.figure, swatch: { kind: key } }];

const legendOf = (
  parts: readonly KkFillGaugePart[],
  other: KkFillGaugeRest | null,
  free: KkFillGaugeRest | null,
): KkFillGaugeLegendItem[] => [
  ...parts.map((part, order) => ({
    key: part.key,
    label: part.label,
    figure: part.figure,
    swatch: { kind: 'part', order } as const,
  })),
  ...restItem('other', other),
  ...restItem('free', free),
];

interface KkFillGaugeProps {
  label: string;
  parts: readonly KkFillGaugePart[];
  other: KkFillGaugeRest | null;
  free: KkFillGaugeRest | null;
  totalBytes: number | null;
  sx?: KkSx;
}

export const KkFillGauge: FC<KkFillGaugeProps> = ({
  label,
  parts,
  other,
  free,
  totalBytes,
  sx,
}) => {
  const reduced = useReducedMotion();
  const shares = fillGaugeSharesOf(
    parts.map((part) => part.bytes),
    free?.bytes ?? null,
    totalBytes,
  );
  const segments: Segment[] = [
    ...parts.map((part, order) => ({
      key: part.key,
      share: shares.parts[order] ?? 0,
      swatch: { kind: 'part', order } as const,
    })),
    { key: 'other', share: shares.other, swatch: { kind: 'other' } },
    { key: 'free', share: shares.free, swatch: { kind: 'free' } },
  ];
  const legend = legendOf(parts, other, free);
  const initial = reduced ? FADED : EMPTY;
  const blocks = segments.map((segment) => (
    <Box
      key={segment.key}
      sx={[{ width: percentOf(segment.share), flexShrink: 0 }, swatchPaint(segment.swatch)]}
    />
  ));

  return (
    <Stack
      data-kk-fill-gauge
      sx={[{ rowGap: 1.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack sx={{ rowGap: 0.5, minWidth: 0 }}>
        <Box
          role="img"
          aria-label={label}
          sx={{ position: 'relative', height: system.gaugeHeight, minWidth: 0 }}
        >
          <Stack
            component={motion.div}
            direction="row"
            initial={initial}
            animate={FILLED}
            transition={FILL}
            sx={(theme) => ({
              height: '100%',
              transformOrigin: 'left center',
              borderRadius: `${kkTokens.radius.bar}px`,
              backgroundColor: inkWash(theme, '6%'),
            })}
          >
            {blocks}
          </Stack>
          <Box
            aria-hidden
            data-kk-fill-cap={shares.cap}
            sx={[
              {
                position: 'absolute',
                top: -2,
                bottom: -2,
                right: 0,
                width: system.gaugeCap,
                borderRadius: `${kkTokens.radius.bar}px`,
              },
              capPaint(shares.cap),
            ]}
          />
        </Box>
        <Box aria-hidden sx={ticksPaint} />
      </Stack>
      <KkFillGaugeLegend items={legend} />
    </Stack>
  );
};
