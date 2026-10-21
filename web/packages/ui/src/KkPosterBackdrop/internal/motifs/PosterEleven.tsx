import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { INK_LINE } from './motif-props';
import { starPoints } from './star-points';

const FIRST_ONE = '24,62 84,22 112,22 112,240 66,240 66,82 24,102';
const SECOND_ONE = '132,62 192,22 220,22 220,240 174,240 174,82 132,102';
const SHADOW_SHIFT = 'translate(9 9)';
const BURST = starPoints(122, 16, 15, 6, 8);

export const PosterEleven: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return (
      <g>
        <polygon points={FIRST_ONE} fill={screen.mid} />
        <polygon points={SECOND_ONE} fill={screen.mid} />
        <rect x={92} y={22} width={20} height={218} fill={screen.deep} />
        <rect x={200} y={22} width={20} height={218} fill={screen.deep} />
      </g>
    );
  }
  if (plate === 'ink') {
    return (
      <g>
        <g transform={SHADOW_SHIFT}>
          <polygon points={FIRST_ONE} fill={screen.light} />
          <polygon points={SECOND_ONE} fill={screen.light} />
        </g>
        <polygon points={FIRST_ONE} {...INK_LINE} />
        <polygon points={SECOND_ONE} {...INK_LINE} />
      </g>
    );
  }

  return (
    <g>
      <polygon points={BURST} fill="currentColor" />
      <circle cx={18} cy={30} r={4} fill="currentColor" />
      <circle cx={234} cy={120} r={5} fill="currentColor" />
      <rect x={140} y={226} width={14} height={14} fill={screen.deep} />
    </g>
  );
};
