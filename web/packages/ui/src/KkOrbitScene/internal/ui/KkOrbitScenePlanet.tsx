import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  centredInset,
  fadedColor,
  ORBIT_REDUCED_MOTION,
  ORBIT_STILL,
  ORBIT_TILT,
  orbitTurn,
  orbitTurnBack,
} from '../orbit-scene-motion';
import type { KkOrbitIndex } from '../orbit-scene-orbits';
import { ORBIT_PATHS, orbitStartDelay } from '../orbit-scene-orbits';
import type { KkOrbitTone } from '../orbit-scene-tone';
import { orbitToneColor } from '../orbit-scene-tone';

const BODY_SIZE = '1rem';
const RING_THICKNESS = '2.5px';

const LANDMASSES = [
  '17% 12% at 22% 24%',
  '13% 19% at 17% 40%',
  '10% 13% at 27% 58%',
  '12% 9% at 33% 70%',
  '7% 12% at 34% 82%',
  '22% 10% at 57% 20%',
  '16% 14% at 75% 27%',
  '10% 9% at 64% 34%',
  '7% 10% at 86% 40%',
  '13% 10% at 59% 54%',
  '10% 14% at 64% 67%',
  '7% 7% at 55% 62%',
  '6% 4% at 86% 72%',
  '4% 3% at 43% 44%',
] as const;

const LAND_TURN: Record<KkOrbitIndex, string> = { 1: '0deg', 2: '140deg', 3: '-110deg' };

const landmassesOf = (hue: string): string =>
  LANDMASSES.map((shape) => `radial-gradient(ellipse ${shape}, ${hue} 92%, transparent 100%)`).join(
    ', ',
  );

const annulus = `radial-gradient(closest-side, transparent calc(100% - ${RING_THICKNESS}), #000 calc(100% - ${RING_THICKNESS}))`;

interface KkOrbitScenePlanetProps {
  tone: KkOrbitTone;
  orbit: KkOrbitIndex;
}

export const KkOrbitScenePlanet: FC<KkOrbitScenePlanetProps> = ({ tone, orbit }) => {
  const path = ORBIT_PATHS[orbit];
  const turn = path.backwards ? orbitTurnBack : orbitTurn;
  const turnBack = path.backwards ? orbitTurn : orbitTurnBack;
  const timing = `${path.seconds}s linear ${orbitStartDelay(path)} infinite`;

  return (
    <Box
      data-kk-orbit-planet
      sx={{
        position: 'absolute',
        inset: centredInset(path.diameter),
        borderRadius: '50%',
        animation: `${turn} ${timing}`,
        [ORBIT_REDUCED_MOTION]: { animation: ORBIT_STILL },
      }}
    >
      <Box
        sx={(theme) => {
          const hue = orbitToneColor(theme, tone);
          const ink = (theme.vars ?? theme).palette.text.primary;

          return {
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            opacity: path.ink,
            backgroundImage: `conic-gradient(from 20deg, transparent 0deg, ${fadedColor(ink, 0.35)} 96deg, ${hue} 214deg, ${fadedColor(hue, 0.25)} 286deg, transparent 348deg)`,
            maskImage: annulus,
            WebkitMaskImage: annulus,
            ...theme.applyStyles('dark', { opacity: path.dark }),
          };
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: BODY_SIZE,
          aspectRatio: '1 / 1',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            animation: `${turnBack} ${timing}`,
            [ORBIT_REDUCED_MOTION]: { animation: ORBIT_STILL },
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, transform: `scaleY(${1 / ORBIT_TILT})` }}>
            <Box
              sx={(theme) => {
                const hue = orbitToneColor(theme, tone);

                return {
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  transform: `rotate(${LAND_TURN[orbit]})`,
                  backgroundColor: (theme.vars ?? theme).palette.common.white,
                  backgroundImage: landmassesOf(hue),
                  boxShadow: `0 0 0 1px ${fadedColor(hue, 0.6)}`,
                };
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundImage: `radial-gradient(circle at 32% 28%, ${fadedColor('#FFFFFF', 0.35)} 0%, transparent 45%, ${fadedColor('#000000', 0.22)} 100%)`,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
