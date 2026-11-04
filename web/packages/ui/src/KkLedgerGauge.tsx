import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from './internal/gold-ink';
import type { KkSx } from './kk-sx';

const SEGMENTS = 8;
const SEGMENT_HEIGHT = 3;
const SEGMENT_GAP = 1.5;
const WIDTH = 14;
const HEIGHT = SEGMENTS * SEGMENT_HEIGHT + (SEGMENTS - 1) * SEGMENT_GAP;

const gaugeInk =
  (warns: boolean) =>
  (theme: Theme): CSSObject =>
    warns ? goldInkOf(theme) : { color: 'text.primary' };

interface KkLedgerGaugeProps {
  share: number;
  warns: boolean;
  label: string;
  sx?: KkSx;
}

export const KkLedgerGauge: FC<KkLedgerGaugeProps> = ({ share, warns, label, sx }) => {
  const filled = share > 0 ? Math.max(1, Math.round(share * SEGMENTS)) : 0;
  const segments = Array.from({ length: SEGMENTS }, (_, index) => {
    const fromBottom = SEGMENTS - 1 - index;
    const lit = fromBottom < filled;

    return (
      <rect
        key={fromBottom}
        x={0}
        y={index * (SEGMENT_HEIGHT + SEGMENT_GAP)}
        width={WIDTH}
        height={SEGMENT_HEIGHT}
        rx={1}
        fill="currentColor"
        opacity={lit ? 1 : 0.16}
      />
    );
  });

  return (
    <Box
      component="svg"
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      data-kk-ledger-gauge
      sx={[
        { width: '0.875rem', height: '1.75rem', flexShrink: 0, mb: 0.25 },
        gaugeInk(warns),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {segments}
    </Box>
  );
};
