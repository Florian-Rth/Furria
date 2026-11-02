import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { LANE_VARS, WAVE_HEIGHT, wavePathOf, waveTop } from '../timeline-paint';

const HIDDEN = { clipPath: 'inset(0 100% 0 0)' } as const;
const SHOWN = { clipPath: 'inset(0 0% 0 0)' } as const;
const DRAW_EASE = [0.33, 0, 0.2, 1] as const;

interface KkTimelineWaveProps {
  bars: readonly number[];
  revealSeconds: number | null;
}

export const KkTimelineWave: FC<KkTimelineWaveProps> = ({ bars, revealSeconds }) => {
  const reduced = useReducedMotion();
  const drawn = revealSeconds !== null && !reduced;
  const path = wavePathOf(bars);
  const view = `0 0 ${Math.max(1, bars.length)} ${WAVE_HEIGHT}`;
  const draw = { duration: revealSeconds ?? 0, ease: DRAW_EASE };
  const initial = drawn ? HIDDEN : false;

  return (
    <Box
      aria-hidden
      data-kk-timeline-wave
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: waveTop,
        bottom: `var(${LANE_VARS.steps})`,
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
            fill: inkWash(theme, '30%'),
          })}
        >
          <path d={path} />
        </Box>
      </Box>
    </Box>
  );
};
