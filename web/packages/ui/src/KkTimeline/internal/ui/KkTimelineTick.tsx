import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';

export interface KkTimelineTickMark {
  key: number;
  from: number;
  to: number;
}

const DROP = { scaleY: 0, opacity: 0 } as const;
const LANDED = { scaleY: 1, opacity: 1 } as const;
const DROP_SECONDS = 0.36;

interface KkTimelineTickProps {
  tick: KkTimelineTickMark;
  active: boolean;
  dropDelay: number | null;
}

export const KkTimelineTick: FC<KkTimelineTickProps> = ({ tick, active, dropDelay }) => {
  const reduced = useReducedMotion();
  const place = { left: percentOf(tick.from), width: percentOf(tick.to - tick.from) };
  const initial = dropDelay === null || reduced ? false : DROP;
  const drop = {
    delay: dropDelay ?? 0,
    duration: DROP_SECONDS,
    ease: [0.34, 1.4, 0.64, 1] as const,
  };

  return (
    <Box
      component={motion.span}
      initial={initial}
      animate={LANDED}
      transition={drop}
      data-active={active}
      style={place}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        transformOrigin: 'top',
        borderLeftWidth: kkTokens.line.section,
        borderLeftStyle: 'solid',
        borderLeftColor: 'text.secondary',
        '&[data-active="true"]': {
          borderLeftColor: 'primary.main',
          backgroundColor: 'primary.main',
          opacity: 1,
        },
      }}
    />
  );
};
