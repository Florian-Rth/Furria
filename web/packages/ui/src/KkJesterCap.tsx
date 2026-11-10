import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
`;

const VIEWBOX = { x: 2, y: 0, width: 120, height: 92 } as const;
const viewBox = `${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`;

const LEFT_TIP = 'M24 65 C22 48 18 36 12 27 C28 32 40 44 46 61 Z';
const MIDDLE_TIP = 'M38 62 C40 36 58 18 82 10 C72 28 70 44 72 60 Z';
const RIGHT_TIP = 'M58 61 C70 38 90 28 110 26 C100 36 98 50 100 64 Z';
const BAND = 'M14 66 Q60 56 106 66 L102 86 Q60 77 18 86 Z';

const bells = [
  { cx: 12, cy: 27 },
  { cx: 82, cy: 10 },
  { cx: 110, cy: 26 },
];

const bandDots = [
  { cx: 30, cy: 73.6 },
  { cx: 45, cy: 72 },
  { cx: 60, cy: 71.5 },
  { cx: 75, cy: 72 },
  { cx: 90, cy: 73.6 },
];

const bellCircles = bells.map((bell) => <circle key={bell.cx} cx={bell.cx} cy={bell.cy} r={6} />);

const bandDotCircles = bandDots.map((dot) => (
  <circle key={dot.cx} cx={dot.cx} cy={dot.cy} r={2.6} strokeWidth={1.5} />
));

interface KkJesterCapProps {
  size?: number;
  rotation?: number;
}

export const KkJesterCap: FC<KkJesterCapProps> = ({ size = 128, rotation = -6 }) => {
  const height = (size * VIEWBOX.height) / VIEWBOX.width;

  return (
    <Box
      data-kk-jester-cap
      aria-hidden
      sx={{ width: size, height, flexShrink: 0, transform: `rotate(${rotation}deg)` }}
    >
      <Box
        component="svg"
        viewBox={viewBox}
        width={size}
        height={height}
        sx={(theme) => ({
          display: 'block',
          stroke: theme.palette.text.primary,
          strokeWidth: 3,
          strokeLinejoin: 'round',
          animation: `${float} 5s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        })}
      >
        <Box component="path" d={LEFT_TIP} sx={{ fill: (theme) => theme.palette.primary.main }} />
        <Box component="path" d={MIDDLE_TIP} sx={{ fill: (theme) => theme.palette.common.white }} />
        <Box component="path" d={RIGHT_TIP} sx={{ fill: (theme) => theme.palette.primary.main }} />
        <Box component="path" d={BAND} sx={{ fill: (theme) => theme.palette.primary.main }} />
        <Box component="g" sx={{ fill: (theme) => theme.palette.common.white }}>
          {bellCircles}
          {bandDotCircles}
        </Box>
      </Box>
    </Box>
  );
};
