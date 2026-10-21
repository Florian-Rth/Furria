import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE, INK_LINE } from './motif-props';
import { starPoints } from './star-points';

const RIBBON = 'M44,0 L116,0 L116,96 L80,122 L44,96 Z';
const LEFT_STRIPE = 'M44,0 L68,0 L68,113 L44,96 Z';
const RIGHT_STRIPE = 'M92,0 L116,0 L116,96 L92,113 Z';
const STAR = starPoints(80, 172, 34, 14, 8);
const MEDAL_RING = 'M80,116 a56,56 0 1,0 0.1,0 Z M80,130 a42,42 0 1,1 -0.1,0 Z';

export const PosterOrder: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return (
      <g>
        <path d={LEFT_STRIPE} fill={screen.mid} />
        <path d={RIGHT_STRIPE} fill={screen.mid} />
        <circle cx={80} cy={172} r={10} fill={screen.deep} />
      </g>
    );
  }
  if (plate === 'ink') {
    return (
      <g>
        <path d={RIBBON} {...INK_LINE} />
        <circle cx={80} cy={172} r={56} {...INK_LINE} />
        <circle cx={80} cy={172} r={42} {...FINE_LINE} />
        <polygon points={STAR} {...FINE_LINE} />
      </g>
    );
  }

  return (
    <g>
      <path d={MEDAL_RING} fill={screen.deep} fillRule="evenodd" />
      <polygon points={STAR} fill={screen.mid} />
      <circle cx={80} cy={118} r={6} {...INK_LINE} />
    </g>
  );
};
