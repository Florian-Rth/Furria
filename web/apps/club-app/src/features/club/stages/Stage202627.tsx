import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';
import type { FC } from 'react';

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
const STILL = 'none';

const orbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const retrograde = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.62; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.07); }
`;

const shimmer = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
`;

interface OrbitRing {
  id: string;
  diameter: number;
  seconds: number;
  retro: boolean;
  thickness: string;
  bodySize: string;
  accent: boolean;
  ink: number;
  dark: number;
}

const RINGS: readonly OrbitRing[] = [
  {
    id: 'mercury',
    diameter: 24,
    seconds: 34,
    retro: false,
    thickness: '1.5px',
    bodySize: '0.34rem',
    accent: true,
    ink: 0.5,
    dark: 0.82,
  },
  {
    id: 'venus',
    diameter: 42,
    seconds: 58,
    retro: true,
    thickness: '1.5px',
    bodySize: '0.5rem',
    accent: false,
    ink: 0.36,
    dark: 0.64,
  },
  {
    id: 'terra',
    diameter: 64,
    seconds: 92,
    retro: false,
    thickness: '2px',
    bodySize: '0.72rem',
    accent: true,
    ink: 0.28,
    dark: 0.52,
  },
  {
    id: 'rim',
    diameter: 92,
    seconds: 148,
    retro: true,
    thickness: '1.5px',
    bodySize: '0.42rem',
    accent: false,
    ink: 0.18,
    dark: 0.34,
  },
];

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
      `radial-gradient(circle ${star.r} at ${star.x} ${star.y}, ${alpha(ink, star.o)} 0%, transparent 100%)`,
  ).join(', ');

const annulusOf = (thickness: string): string =>
  `radial-gradient(closest-side, transparent calc(100% - ${thickness}), #000 calc(100% - ${thickness}))`;

const SYSTEM_CENTRE_X = { xs: '76%', desktop: '81%' };
const SYSTEM_HEIGHT = { xs: '210%', desktop: '190%' };
const CORE_BLOOM = 15;
const CORE_DISC = 4.6;
const RAY_SECONDS = 220;
const BLOOM_SECONDS = 7.5;
const STAR_SECONDS = 9;

const centredInset = (diameter: number): string => `${(100 - diameter) / 2}%`;

export const Stage202627: FC = () => (
  <Box
    aria-hidden
    data-stage-202627
    sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
  >
    <Box
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        opacity: 0.55,
        backgroundImage: `radial-gradient(120% 150% at 80% 46%, ${alpha((theme.vars ?? theme).palette.primary.main, 0.1)} 0%, transparent 62%)`,
        ...theme.applyStyles('dark', {
          opacity: 1,
          backgroundImage: `radial-gradient(120% 150% at 80% 46%, ${alpha((theme.vars ?? theme).palette.primary.main, 0.22)} 0%, transparent 64%)`,
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
        [REDUCED_MOTION]: { animation: STILL, opacity: 0.28 },
        ...theme.applyStyles('dark', { opacity: 0.7 }),
      })}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: SYSTEM_CENTRE_X,
        height: SYSTEM_HEIGHT,
        aspectRatio: '1 / 1',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          opacity: 0.22,
          backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${alpha((theme.vars ?? theme).palette.primary.main, 0.9)} 0deg 0.6deg, transparent 0.6deg 9deg)`,
          maskImage: 'radial-gradient(closest-side, #000 6%, transparent 54%)',
          WebkitMaskImage: 'radial-gradient(closest-side, #000 6%, transparent 54%)',
          animation: `${orbit} ${RAY_SECONDS}s linear infinite`,
          [REDUCED_MOTION]: { animation: STILL },
          ...theme.applyStyles('dark', { opacity: 0.42 }),
        })}
      />
      {RINGS.map((ring) => (
        <Box
          key={ring.id}
          sx={{
            position: 'absolute',
            inset: centredInset(ring.diameter),
            borderRadius: '50%',
            animation: `${ring.retro ? retrograde : orbit} ${ring.seconds}s linear infinite`,
            [REDUCED_MOTION]: { animation: STILL },
          }}
        >
          <Box
            sx={(theme) => {
              const hue = ring.accent
                ? (theme.vars ?? theme).palette.primary.main
                : (theme.vars ?? theme).palette.warning.main;
              const ink = (theme.vars ?? theme).palette.text.primary;

              return {
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                opacity: ring.ink,
                backgroundImage: `conic-gradient(from 20deg, transparent 0deg, ${alpha(ink, 0.35)} 96deg, ${hue} 214deg, ${alpha(hue, 0.25)} 286deg, transparent 348deg)`,
                maskImage: annulusOf(ring.thickness),
                WebkitMaskImage: annulusOf(ring.thickness),
                ...theme.applyStyles('dark', { opacity: ring.dark }),
              };
            }}
          />
          <Box
            sx={(theme) => {
              const hue = ring.accent
                ? (theme.vars ?? theme).palette.primary.main
                : (theme.vars ?? theme).palette.warning.main;

              return {
                position: 'absolute',
                top: 0,
                left: '50%',
                width: ring.bodySize,
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundImage: `radial-gradient(circle at 32% 28%, ${alpha('#FFFFFF', 0.85)} 0%, ${hue} 62%, ${alpha(hue, 0.55)} 100%)`,
                boxShadow: `0 0 12px ${alpha(hue, 0.45)}`,
                opacity: 0.75,
                ...theme.applyStyles('dark', { opacity: 1 }),
              };
            }}
          />
        </Box>
      ))}
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: centredInset(CORE_BLOOM),
          borderRadius: '50%',
          filter: 'blur(18px)',
          opacity: 0.45,
          backgroundImage: `radial-gradient(circle, ${(theme.vars ?? theme).palette.warning.main} 0%, ${(theme.vars ?? theme).palette.primary.main} 44%, transparent 72%)`,
          animation: `${breathe} ${BLOOM_SECONDS}s ease-in-out infinite`,
          [REDUCED_MOTION]: { animation: STILL },
          ...theme.applyStyles('dark', { opacity: 0.8 }),
        })}
      />
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: centredInset(CORE_DISC),
          borderRadius: '50%',
          backgroundImage: `radial-gradient(circle at 34% 28%, ${alpha('#FFFFFF', 0.92)} 0%, ${(theme.vars ?? theme).palette.warning.main} 34%, ${(theme.vars ?? theme).palette.primary.main} 100%)`,
          boxShadow: `0 0 26px ${alpha((theme.vars ?? theme).palette.primary.main, 0.5)}`,
          opacity: 0.88,
          ...theme.applyStyles('dark', {
            opacity: 1,
            boxShadow: `0 0 34px ${alpha((theme.vars ?? theme).palette.primary.main, 0.75)}`,
          }),
        })}
      />
    </Box>
  </Box>
);
