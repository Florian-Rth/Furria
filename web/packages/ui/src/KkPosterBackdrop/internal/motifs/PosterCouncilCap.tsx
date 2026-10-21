import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE, INK_LINE } from './motif-props';
import { starPoints } from './star-points';

const BODY = 'M18,140 L38,48 Q130,98 222,48 L242,140 Z';
const BODY_SHADE = 'M130,73 Q176,72 222,48 L242,140 L130,140 Z';
const BAND = 'M18,140 L242,140 L237,116 Q130,126 23,116 Z';
const FOLD = 'M44,64 Q130,112 216,64';
const EMBLEM = starPoints(84, 96, 15, 6, 8);

export const PosterCouncilCap: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return (
      <g>
        <path d={BODY} fill={screen.mid} />
        <path d={BODY_SHADE} fill={screen.deep} />
      </g>
    );
  }
  if (plate === 'ink') {
    return (
      <g>
        <path d={BODY} {...INK_LINE} />
        <path d={BAND} {...INK_LINE} />
        <path d={FOLD} {...FINE_LINE} />
        <circle cx={84} cy={96} r={20} {...FINE_LINE} />
      </g>
    );
  }

  return (
    <g>
      <path d={BAND} fill={screen.mid} />
      <polygon points={EMBLEM} fill="currentColor" />
      <circle cx={38} cy={46} r={9} fill={screen.deep} />
      <circle cx={222} cy={46} r={9} fill={screen.deep} />
    </g>
  );
};
