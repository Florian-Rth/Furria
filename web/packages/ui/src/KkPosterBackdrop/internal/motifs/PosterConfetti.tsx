import type { FC } from 'react';
import type { PosterPlate } from '../logic/poster-composition';
import type { MotifProps } from './motif-props';

type Bit = readonly [
  plate: PosterPlate,
  shape: 'strip' | 'dot' | 'wedge',
  x: number,
  y: number,
  turn: number,
];

const BITS: readonly Bit[] = [
  ['red', 'strip', 40, 36, 24],
  ['gold', 'dot', 92, 22, 0],
  ['ink', 'wedge', 150, 48, 40],
  ['red', 'strip', 214, 30, -38],
  ['gold', 'strip', 262, 70, 70],
  ['red', 'dot', 24, 108, 0],
  ['ink', 'strip', 86, 92, -12],
  ['gold', 'wedge', 130, 128, 160],
  ['red', 'strip', 186, 110, 52],
  ['ink', 'dot', 240, 136, 0],
  ['gold', 'strip', 48, 176, -60],
  ['red', 'wedge', 104, 196, 18],
  ['ink', 'strip', 166, 186, 84],
  ['red', 'dot', 222, 214, 0],
  ['gold', 'dot', 276, 196, 0],
  ['red', 'strip', 30, 252, 36],
  ['ink', 'dot', 92, 266, 0],
  ['gold', 'strip', 146, 254, -24],
  ['red', 'strip', 206, 276, 66],
  ['ink', 'wedge', 262, 252, -70],
];

const SHAPES = {
  strip: <rect x={-9} y={-3.5} width={18} height={7} rx={1} />,
  dot: <circle r={4.5} />,
  wedge: <polygon points="-7,6 7,6 0,-7" />,
} as const;

export const PosterConfetti: FC<MotifProps> = ({ plate }) => {
  const bits = BITS.filter(([bitPlate]) => bitPlate === plate).map(([, shape, x, y, turn]) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${turn})`}>
      {SHAPES[shape]}
    </g>
  ));

  return <g fill="currentColor">{bits}</g>;
};
