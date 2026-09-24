import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { LETTER_ORIGIN_X, LETTER_ORIGIN_Y } from '../logic/sway-pose';
import type { SwayScene } from '../logic/sway-values';

interface SwayRestSwingProps {
  rest: ReactNode;
  scene: SwayScene;
}

export const SwayRestSwing: FC<SwayRestSwingProps> = ({ rest, scene }) => {
  const values = scene.restLetters.at(0);

  if (values === undefined) {
    return rest;
  }

  const swayStyle = {
    x: values.x,
    rotate: values.rotate,
    opacity: values.opacity,
    originX: LETTER_ORIGIN_X,
    originY: LETTER_ORIGIN_Y,
  };

  return <motion.div style={swayStyle}>{rest}</motion.div>;
};
