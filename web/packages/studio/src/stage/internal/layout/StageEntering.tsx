import { motion, useReducedMotion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { StageEntrance } from './StagePlace';

const PERCENT = 100;
const ENTRANCE_SECONDS = 0.9;
const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;
const STILL = { x: '0cqw', y: '0cqh' } as const;

interface StageEnteringProps extends PropsWithChildren {
  x: number;
  y: number;
  from: StageEntrance;
}

export const StageEntering: FC<StageEnteringProps> = ({ x, y, from, children }) => {
  const reduced = useReducedMotion() ?? false;
  const initial = reduced
    ? false
    : { x: `${(from.x - x) * PERCENT}cqw`, y: `${(from.y - y) * PERCENT}cqh` };
  const timing = { delay: from.delay, duration: ENTRANCE_SECONDS, ease: ENTRANCE_EASE };

  return (
    <motion.div initial={initial} animate={STILL} transition={timing}>
      {children}
    </motion.div>
  );
};
