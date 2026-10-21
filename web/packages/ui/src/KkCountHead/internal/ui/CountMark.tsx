import type { MotionValue } from 'motion/react';
import { motion, useTransform } from 'motion/react';
import type { FC } from 'react';
import type { CountReveal } from '../logic/use-count-board';
import { CountGlyph } from './CountGlyph';

const SHOWN = 1;
const HIDDEN = 0;

interface CountMarkProps {
  face: string;
  reveal: CountReveal;
  clock: MotionValue<number>;
}

const shareOf = (reveal: CountReveal, elapsed: number): number => {
  if (reveal.kind === 'landing') {
    return elapsed >= reveal.at ? SHOWN : HIDDEN;
  }

  return reveal.kind === 'shown' ? SHOWN : HIDDEN;
};

export const CountMark: FC<CountMarkProps> = ({ face, reveal, clock }) => {
  const opacity = useTransform(clock, (elapsed: number): number => shareOf(reveal, elapsed));
  const shown = { opacity };

  return (
    <motion.span style={shown}>
      <CountGlyph ink="mark">{face}</CountGlyph>
    </motion.span>
  );
};
