import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE, INK_LINE } from './motif-props';

const BODY =
  'M18,62 C56,22 150,16 214,52 L256,22 C248,42 248,80 256,100 L214,70 C150,106 56,102 18,62 Z';
const BELLY = 'M34,70 C76,92 150,94 208,70 C150,84 76,84 34,70 Z';
const GILL = 'M80,36 C90,52 90,72 80,88';
const SPINE = 'M94,61 L204,60';
const DORSAL = 'M118,30 L140,12 L160,30';
const RIBS = [112, 132, 152, 172, 192].map((x) => `M${x},50 L${x + 6},61 L${x},72`);

export const PosterHerring: FC<MotifProps> = ({ plate, screen }) => {
  if (plate !== 'ink') {
    return null;
  }

  const ribs = RIBS.map((d) => <path key={d} d={d} {...FINE_LINE} />);

  return (
    <g>
      <path d={BELLY} fill={screen.light} />
      <path d={BODY} {...INK_LINE} />
      <path d={DORSAL} {...INK_LINE} />
      <path d={GILL} {...FINE_LINE} />
      <path d={SPINE} {...FINE_LINE} />
      {ribs}
      <circle cx={46} cy={56} r={5} {...FINE_LINE} />
    </g>
  );
};
