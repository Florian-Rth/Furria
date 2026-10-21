import type { FC } from 'react';

const DOT_SHARE = { light: 0.15, mid: 0.25, deep: 0.35 } as const;
const TONES = ['light', 'mid', 'deep'] as const;
const MAX_SHARE = 0.5;

interface MotifScreensProps {
  id: string;
  pitch: number;
  angle: number;
  density: number;
}

export const MotifScreens: FC<MotifScreensProps> = ({ id, pitch, angle, density }) => {
  const half = pitch / 2;
  const patterns = TONES.map((tone) => {
    const radius = pitch * Math.min(DOT_SHARE[tone] * density, MAX_SHARE);

    return (
      <pattern
        key={tone}
        id={`${id}-${tone}`}
        width={pitch}
        height={pitch}
        patternUnits="userSpaceOnUse"
        patternTransform={`rotate(${angle})`}
      >
        <g fill="currentColor">
          <circle cx={0} cy={0} r={radius} />
          <circle cx={pitch} cy={0} r={radius} />
          <circle cx={0} cy={pitch} r={radius} />
          <circle cx={pitch} cy={pitch} r={radius} />
          <circle cx={half} cy={half} r={radius} />
        </g>
      </pattern>
    );
  });

  return <defs>{patterns}</defs>;
};
