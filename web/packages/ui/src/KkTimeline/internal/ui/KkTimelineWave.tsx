import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkTimelineSpan, KkTimelineWaveLane } from '../timeline-paint';
import {
  spanPlaceOf,
  WAVE_HEIGHT,
  WAVE_LANE_EDGES,
  wavePathOf,
  withinClipOf,
} from '../timeline-paint';

const HIDDEN = { clipPath: 'inset(0 100% 0 0)' } as const;
const SHOWN = { clipPath: 'inset(0 0% 0 0)' } as const;
const DRAW_EASE = [0.33, 0, 0.2, 1] as const;

interface KkTimelineWaveProps {
  bars: readonly number[];
  revealSeconds: number | null;
  span?: KkTimelineSpan;
  lane?: KkTimelineWaveLane;
  within?: KkTimelineSpan | null;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const LANE_FILLS: Record<KkTimelineWaveLane, (theme: Theme) => string> = {
  wave: (theme) => inkWash(theme, '30%'),
  videos: (theme) => `color-mix(in srgb, ${palette(theme).info.main} 55%, transparent)`,
};

export const KkTimelineWave: FC<KkTimelineWaveProps> = ({
  bars,
  revealSeconds,
  span,
  lane = 'wave',
  within = null,
}) => {
  const clipPath = withinClipOf(span, within);
  const reduced = useReducedMotion();
  const drawn = revealSeconds !== null && !reduced;
  const path = wavePathOf(bars);
  const view = `0 0 ${Math.max(1, bars.length)} ${WAVE_HEIGHT}`;
  const draw = { duration: revealSeconds ?? 0, ease: DRAW_EASE };
  const initial = drawn ? HIDDEN : false;

  return (
    <Box
      aria-hidden
      data-kk-timeline-wave={lane}
      style={{ ...spanPlaceOf(span), clipPath }}
      sx={{
        position: 'absolute',
        ...WAVE_LANE_EDGES[lane],
        pointerEvents: 'none',
      }}
    >
      <Box
        component={motion.div}
        initial={initial}
        animate={SHOWN}
        transition={draw}
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Box
          component="svg"
          viewBox={view}
          preserveAspectRatio="none"
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            fill: LANE_FILLS[lane](theme),
          })}
        >
          <path d={path} />
        </Box>
      </Box>
    </Box>
  );
};
