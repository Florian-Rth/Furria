import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { TargetAndTransition, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { rowDividerTop } from './internal/row-divider';
import type { KkStatusLevel } from './internal/status-paint';
import { statusInk } from './internal/status-paint';
import { useReducedMotion } from './internal/use-reduced-motion';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkHeartbeatState = 'alive' | 'stale' | 'gone';

const VIEW_WIDTH = 96;
const VIEW_HEIGHT = 20;
const MID = VIEW_HEIGHT / 2;
const STROKE = 1.5;
const FLAT = `M0 ${MID}H${VIEW_WIDTH}`;
const PULSE = `M0 ${MID}H58L62 ${MID - 7}L67 ${MID + 7}L71 ${MID - 3}L74 ${MID}H${VIEW_WIDTH}`;
const STRIKE = `M30 ${VIEW_HEIGHT - 2}L66 2`;
const BLIP: TargetAndTransition = { pathLength: [0, 1], opacity: [0.35, 1] };
const BLIP_TRANSITION: Transition = { duration: 0.7, ease: 'easeOut' };

const LEVELS: Record<KkHeartbeatState, KkStatusLevel> = {
  alive: 'ok',
  stale: 'attention',
  gone: 'broken',
};

const linePaint =
  (state: KkHeartbeatState) =>
  (theme: Theme): CSSObject =>
    state === 'alive' ? { color: 'text.primary' } : statusInk(theme, LEVELS[state]);

interface KkHeartbeatProps {
  state: KkHeartbeatState;
  beatKey: string;
  title: string;
  word: string;
  meta: readonly string[];
  sx?: KkSx;
}

export const KkHeartbeat: FC<KkHeartbeatProps> = ({ state, beatKey, title, word, meta, sx }) => {
  const reduced = useReducedMotion();
  const alive = state === 'alive';
  const path = alive ? PULSE : FLAT;
  const blip = alive && !reduced ? BLIP : undefined;
  const strike = state === 'gone' ? <path d={STRIKE} strokeWidth={STROKE * 1.4} /> : null;
  const metaLine = meta.join(' · ');

  return (
    <Stack
      direction="row"
      data-kk-heartbeat={state}
      sx={[
        { alignItems: 'center', columnGap: 1.5, minWidth: 0, py: 1, ...rowDividerTop },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        sx={[
          { width: kkTokens.system.pulseWidth, height: VIEW_HEIGHT, flexShrink: 0 },
          linePaint(state),
        ]}
      >
        <motion.path
          key={beatKey}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinejoin="round"
          animate={blip}
          transition={BLIP_TRANSITION}
        />
        <g stroke="currentColor">{strike}</g>
      </Box>
      <Stack sx={{ flexGrow: 1, minWidth: 0, rowGap: 0.125 }}>
        <Typography
          component="span"
          sx={{ typography: 'body2', fontWeight: 800, overflowWrap: 'anywhere' }}
        >
          {title}
        </Typography>
        <Typography component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
          {metaLine}
        </Typography>
      </Stack>
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.caption,
          fontWeight: 900,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          ...statusInk(theme, LEVELS[state]),
        })}
      >
        {word}
      </Typography>
    </Stack>
  );
};
