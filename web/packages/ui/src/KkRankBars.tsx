import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from './internal/ink-wash';
import { rowDividerTop } from './internal/row-divider';
import { useReducedMotion } from './internal/use-reduced-motion';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { system } = kkTokens;
const EMPTY = { scaleX: 0 } as const;
const FADED = { opacity: 0 } as const;
const FILLED = { scaleX: 1, opacity: 1 } as const;
const BAR_STAGGER_SECONDS = 0.06;

export interface KkRankBar {
  key: string;
  label: string;
  value: string;
  meta?: string;
  weight: number;
}

const widthOf = (weight: number, heaviest: number): string =>
  heaviest > 0 ? `${((Math.max(weight, 0) / heaviest) * 100).toFixed(2)}%` : '0%';

interface KkRankBarsProps {
  label: string;
  bars: readonly KkRankBar[];
  sx?: KkSx;
}

export const KkRankBars: FC<KkRankBarsProps> = ({ label, bars, sx }) => {
  const reduced = useReducedMotion();
  const heaviest = Math.max(0, ...bars.map((bar) => bar.weight));
  const initial = reduced ? FADED : EMPTY;
  const rows = bars.map((bar, order) => {
    const transition = {
      duration: system.fillSeconds,
      delay: order * BAR_STAGGER_SECONDS,
      ease: 'easeOut',
    } as const;
    const meta =
      bar.meta === undefined ? null : (
        <Typography
          component="span"
          sx={{ typography: 'caption', color: 'text.disabled', whiteSpace: 'nowrap' }}
        >
          {bar.meta}
        </Typography>
      );

    return (
      <Stack component="li" key={bar.key} sx={{ rowGap: 0.375, py: 0.75, ...rowDividerTop }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1, minWidth: 0 }}>
          <Typography
            component="span"
            sx={{
              typography: 'body2',
              fontWeight: 800,
              minWidth: 0,
              flexGrow: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bar.label}
          </Typography>
          {meta}
          <Typography
            component="span"
            variant="h4"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: kkTokens.type.tracking.display,
            }}
          >
            {bar.value}
          </Typography>
        </Stack>
        <Box
          aria-hidden
          sx={(theme) => ({ height: kkTokens.line.hair, backgroundColor: inkWash(theme, '10%') })}
        >
          <Box
            component={motion.div}
            initial={initial}
            animate={FILLED}
            transition={transition}
            sx={{
              width: widthOf(bar.weight, heaviest),
              height: '100%',
              transformOrigin: 'left center',
              backgroundColor: 'text.primary',
            }}
          />
        </Box>
      </Stack>
    );
  });

  return (
    <Stack
      component="ol"
      aria-label={label}
      data-kk-rank-bars
      sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {rows}
    </Stack>
  );
};
