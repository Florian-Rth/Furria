import { motion, useReducedMotion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { resolveStepTransition } from '../logic/step-motion';

export const KompassStepReveal: FC<PropsWithChildren> = ({ children }) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={resolveStepTransition(reducedMotion)}
    >
      {children}
    </motion.div>
  );
};
