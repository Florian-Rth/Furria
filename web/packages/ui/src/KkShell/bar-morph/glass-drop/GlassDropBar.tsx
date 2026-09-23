import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkBarMorphBarProps } from '../../bar-morph';
import { pillPathOf, sheenPathOf } from './logic/glass-drop-paths';
import { motionActOf } from './logic/glass-drop-plan';
import { useGlassDropPlan } from './logic/use-glass-drop-plan';
import { GlassDropSheen } from './ui/GlassDropSheen';

const BAR_STYLE = { position: 'relative', transformOrigin: '8% 50%' } as const;
const AT_REST = { scaleX: 1, scaleY: 1 };

export const GlassDropBar: FC<KkBarMorphBarProps> = ({ scene, children }) => {
  const plan = useGlassDropPlan(scene);
  const act = motionActOf(plan.act);

  if (act === null) {
    return (
      <motion.div style={BAR_STYLE} initial={false} animate={AT_REST}>
        {children}
      </motion.div>
    );
  }

  const pill = pillPathOf(act);
  const animate = { scaleX: pill.scaleX, scaleY: pill.scaleY };
  const transition = { duration: pill.duration, delay: pill.delay, times: pill.times };

  return (
    <motion.div style={BAR_STYLE} initial={AT_REST} animate={animate} transition={transition}>
      {children}
      <GlassDropSheen path={sheenPathOf(act, plan.direction)} />
    </motion.div>
  );
};
