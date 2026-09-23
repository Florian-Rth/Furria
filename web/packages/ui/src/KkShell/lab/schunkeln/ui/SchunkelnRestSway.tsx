import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { LETTER_ORIGIN_X, LETTER_ORIGIN_Y } from '../logic/schunkel-pose';
import type { SchunkelScene } from '../logic/schunkel-values';

interface SchunkelnRestSwayProps {
  rest: ReactNode;
  scene: SchunkelScene;
}

export const SchunkelnRestSway: FC<SchunkelnRestSwayProps> = ({ rest, scene }) => {
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
