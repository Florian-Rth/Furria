import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { CountFaceVisibility } from '../logic/count-run';

const STAR_RAYS = 6;
const STAR_INNER = 0.42;
const HALF = 50;
const STAR_OUTLINE = Array.from({ length: STAR_RAYS * 2 }, (_, corner) => {
  const radius = corner % 2 === 0 ? HALF : HALF * STAR_INNER;
  const angle = (Math.PI * corner) / STAR_RAYS - Math.PI / 2;

  return `${(HALF + radius * Math.cos(angle)).toFixed(2)}% ${(HALF + radius * Math.sin(angle)).toFixed(2)}%`;
}).join(', ');

const STACK: CSSProperties = { display: 'inline-grid', placeItems: 'center' };
const LETTER: CSSProperties = { gridArea: '1 / 1' };
const STAR: CSSProperties = {
  gridArea: '1 / 1',
  width: '0.44em',
  height: '0.44em',
  backgroundColor: 'currentColor',
  clipPath: `polygon(${STAR_OUTLINE})`,
};

interface CountFaceProps {
  face: string | MotionValue<string>;
  letter: CountFaceVisibility | MotionValue<CountFaceVisibility>;
  star: CountFaceVisibility | MotionValue<CountFaceVisibility>;
}

export const CountFace: FC<CountFaceProps> = ({ face, letter, star }) => (
  <span style={STACK}>
    <motion.span style={{ ...LETTER, visibility: letter }}>{face}</motion.span>
    <motion.span aria-hidden style={{ ...STAR, visibility: star }} />
  </span>
);
