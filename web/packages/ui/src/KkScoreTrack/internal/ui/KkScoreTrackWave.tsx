import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, percentOf, WAVE_HEIGHT, wavePathOf, waveTop } from '../score-paint';

const HIDDEN = { clipPath: 'inset(0 100% 0 0)' } as const;
const SHOWN = { clipPath: 'inset(0 0% 0 0)' } as const;
const DRAW_EASE = [0.33, 0, 0.2, 1] as const;

interface KkScoreTrackWaveProps {
  bars: readonly number[];
  seams: readonly number[];
  eights: readonly number[];
  reveal: boolean;
  revealSeconds: number;
}

export const KkScoreTrackWave: FC<KkScoreTrackWaveProps> = ({
  bars,
  seams,
  eights,
  reveal,
  revealSeconds,
}) => {
  const reduced = useReducedMotion();
  const drawn = reveal && !reduced;
  const path = wavePathOf(bars);
  const view = `0 0 ${Math.max(1, bars.length)} ${WAVE_HEIGHT}`;
  const draw = { duration: revealSeconds, ease: DRAW_EASE };
  const initial = drawn ? HIDDEN : false;
  const lines = eights.map((share) => (
    <Box
      key={share}
      component="span"
      style={{ left: percentOf(share) }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderLeft: `1px solid ${inkWash(theme, '7%')}`,
      })}
    />
  ));
  const cuts = seams.map((share) => (
    <Box
      key={share}
      component="span"
      data-kk-score-seam
      style={{ left: percentOf(share) }}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderLeftWidth: kkTokens.line.hair,
        borderLeftStyle: 'dashed',
        borderLeftColor: 'text.disabled',
      }}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-score-wave
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: waveTop,
        bottom: `var(${LANE_VARS.steps})`,
        pointerEvents: 'none',
      }}
    >
      {lines}
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
      {cuts}
    </Box>
  );
};
