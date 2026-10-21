import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE, INK_LINE } from './motif-props';

const LEFT_LOBE = 'M50,172 C42,124 26,94 14,72 C48,76 80,104 98,156 Z';
const MIDDLE_LOBE = 'M88,158 C92,102 106,56 120,26 C134,56 148,102 152,158 Z';
const RIGHT_LOBE = 'M190,172 C198,124 214,94 226,72 C192,76 160,104 142,156 Z';
const BAND = 'M44,170 Q120,150 196,170 L196,196 Q120,176 44,196 Z';
const BAND_DIAMONDS = [72, 96, 120, 144, 168].map(
  (x) => `M${x},${172 - Math.abs(120 - x) * 0.08} l7,-7 l7,7 l-7,7 Z`,
);
const BELLS = [
  [14, 70],
  [120, 22],
  [226, 70],
] as const;

export const PosterJesterCap: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return (
      <g>
        <path d={LEFT_LOBE} fill={screen.deep} />
        <path d={RIGHT_LOBE} fill={screen.deep} />
        <path d={MIDDLE_LOBE} fill={screen.light} />
        <path d={BAND} fill={screen.mid} />
      </g>
    );
  }
  if (plate === 'ink') {
    const diamonds = BAND_DIAMONDS.map((d) => <path key={d} d={d} fill="currentColor" />);
    const bells = BELLS.map(([cx, cy]) => (
      <g key={cx}>
        <circle cx={cx} cy={cy} r={11} {...INK_LINE} />
        <path d={`M${cx - 6},${cy + 3} L${cx + 6},${cy + 3}`} {...FINE_LINE} />
      </g>
    ));

    return (
      <g>
        <path d={LEFT_LOBE} {...INK_LINE} />
        <path d={RIGHT_LOBE} {...INK_LINE} />
        <path d={MIDDLE_LOBE} {...INK_LINE} />
        <path d={BAND} {...INK_LINE} />
        {diamonds}
        {bells}
      </g>
    );
  }

  const bells = BELLS.map(([cx, cy]) => (
    <circle key={cx} cx={cx} cy={cy} r={10} fill={screen.deep} />
  ));

  return <g>{bells}</g>;
};
