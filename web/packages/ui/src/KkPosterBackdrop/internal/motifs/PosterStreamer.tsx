import type { FC } from 'react';
import type { MotifProps } from './motif-props';
import { FINE_LINE } from './motif-props';

const CURL =
  'M8,126 C60,46 112,40 102,92 C94,134 58,114 80,80 C112,36 172,48 182,100 C190,142 150,134 166,96 C188,52 252,60 262,106 C268,138 234,134 246,100 C262,58 330,48 392,36';
const RIBBON = { fill: 'none', strokeWidth: 13, strokeLinecap: 'round' } as const;

export const PosterStreamer: FC<MotifProps> = ({ plate, screen }) => {
  if (plate === 'red') {
    return <path d={CURL} stroke={screen.deep} {...RIBBON} />;
  }
  if (plate === 'ink') {
    return <path d={CURL} {...FINE_LINE} />;
  }

  return null;
};
