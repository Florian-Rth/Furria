import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE, INK_LINE } from './motif-props';

const LEFT_TWIST = 'M62,55 L18,24 Q30,55 18,86 Z';
const RIGHT_TWIST = 'M138,55 L182,24 Q170,55 182,86 Z';
const STRIPES = ['M86,30 L74,78', 'M106,28 L94,82', 'M126,32 L116,78'];

export const PosterCandy: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return (
      <g>
        <ellipse cx={100} cy={55} rx={40} ry={28} fill={screen.deep} />
        <path d={LEFT_TWIST} fill={screen.light} />
        <path d={RIGHT_TWIST} fill={screen.light} />
      </g>
    );
  }
  if (plate === 'ink') {
    const stripes = STRIPES.map((d) => <path key={d} d={d} {...FINE_LINE} />);

    return (
      <g>
        <ellipse cx={100} cy={55} rx={40} ry={28} {...INK_LINE} />
        <path d={LEFT_TWIST} {...INK_LINE} />
        <path d={RIGHT_TWIST} {...INK_LINE} />
        {stripes}
      </g>
    );
  }

  return null;
};
