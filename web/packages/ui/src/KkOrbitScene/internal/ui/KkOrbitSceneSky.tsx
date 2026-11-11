import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { fadedColor, ORBIT_REDUCED_MOTION, ORBIT_STILL } from '../orbit-scene-motion';

const shimmer = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
`;

const STAR_SECONDS = 9;

const STARS: readonly { x: string; y: string; r: string; o: number }[] = [
  { x: '6%', y: '22%', r: '1px', o: 0.9 },
  { x: '13%', y: '68%', r: '1.5px', o: 0.6 },
  { x: '19%', y: '12%', r: '1px', o: 0.45 },
  { x: '24%', y: '84%', r: '1px', o: 0.8 },
  { x: '31%', y: '38%', r: '1.5px', o: 0.35 },
  { x: '37%', y: '73%', r: '1px', o: 0.55 },
  { x: '43%', y: '16%', r: '1px', o: 0.7 },
  { x: '49%', y: '58%', r: '1.5px', o: 0.3 },
  { x: '56%', y: '88%', r: '1px', o: 0.6 },
  { x: '62%', y: '26%', r: '1px', o: 0.4 },
  { x: '68%', y: '64%', r: '1.5px', o: 0.5 },
  { x: '74%', y: '9%', r: '1px', o: 0.75 },
  { x: '81%', y: '80%', r: '1px', o: 0.45 },
  { x: '87%', y: '34%', r: '1.5px', o: 0.6 },
  { x: '93%', y: '70%', r: '1px', o: 0.5 },
  { x: '97%', y: '18%', r: '1px', o: 0.8 },
];

const starfieldOf = (ink: string): string =>
  STARS.map(
    (star) =>
      `radial-gradient(circle ${star.r} at ${star.x} ${star.y}, ${fadedColor(ink, star.o)} 0%, transparent 100%)`,
  ).join(', ');

export const KkOrbitSceneSky: FC = () => (
  <>
    <Box
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        opacity: 0.6,
        backgroundImage: `radial-gradient(120% 150% at 78% 46%, ${fadedColor((theme.vars ?? theme).palette.primary.main, 0.06)} 0%, transparent 62%)`,
        ...theme.applyStyles('dark', {
          opacity: 1,
          backgroundImage: `radial-gradient(120% 150% at 78% 46%, ${fadedColor((theme.vars ?? theme).palette.primary.main, 0.1)} 0%, transparent 64%)`,
        }),
      })}
    />
    <Box
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        opacity: 0.32,
        backgroundRepeat: 'no-repeat',
        backgroundImage: starfieldOf((theme.vars ?? theme).palette.text.primary),
        animation: `${shimmer} ${STAR_SECONDS}s ease-in-out infinite`,
        [ORBIT_REDUCED_MOTION]: { animation: ORBIT_STILL, opacity: 0.28 },
        ...theme.applyStyles('dark', { opacity: 0.7 }),
      })}
    />
  </>
);
