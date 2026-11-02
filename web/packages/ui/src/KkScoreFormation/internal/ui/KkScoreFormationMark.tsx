import { motion } from 'motion/react';
import type { FC } from 'react';

const ENTRANCE_SECONDS = 0.9;
const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;
const STILL = { x: 0, y: 0 } as const;
const AT_ONCE = { duration: 0 } as const;

export interface KkScoreFormationMarkFrom {
  dx: number;
  dy: number;
  delay: number;
}

interface KkScoreFormationMarkProps {
  cx: number;
  cy: number;
  radius: number;
  halo: number;
  own: boolean;
  open: boolean;
  from: KkScoreFormationMarkFrom | null;
}

export const KkScoreFormationMark: FC<KkScoreFormationMarkProps> = ({
  cx,
  cy,
  radius,
  halo,
  own,
  open,
  from,
}) => {
  const initial = from === null ? false : { x: from.dx, y: from.dy };
  const transition =
    from === null
      ? AT_ONCE
      : { delay: from.delay, duration: ENTRANCE_SECONDS, ease: ENTRANCE_EASE };
  const ring = own && halo > 0 ? <circle cx={cx} cy={cy} r={halo} data-kk-formation-halo /> : null;

  return (
    <motion.g initial={initial} animate={STILL} transition={transition}>
      {ring}
      <circle cx={cx} cy={cy} r={radius} data-kk-formation-dot data-own={own} data-open={open} />
    </motion.g>
  );
};
