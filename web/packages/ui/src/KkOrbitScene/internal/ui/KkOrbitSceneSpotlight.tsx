import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { fadedColor, ORBIT_REDUCED_MOTION, ORBIT_STILL } from '../orbit-scene-motion';

const LAMP = { x: 63, y: 22 };
const LAMP_HALF_WIDTH = 0.6;
const POOL = { y: 56, halfWidth: 18 };
const SPOT = { width: 48, height: 16 };
const SWAY_DEGREES = 2.5;
const SWAY_SECONDS = 7;

const sway = keyframes`
  from { transform: rotate(-${SWAY_DEGREES}deg); }
  to { transform: rotate(${SWAY_DEGREES}deg); }
`;

const cone = `polygon(${LAMP.x - LAMP_HALF_WIDTH}% ${LAMP.y}%, ${LAMP.x + LAMP_HALF_WIDTH}% ${LAMP.y}%, ${50 + POOL.halfWidth}% ${POOL.y}%, ${50 - POOL.halfWidth}% ${POOL.y}%)`;

export const KkOrbitSceneSpotlight: FC = () => (
  <>
    <Box
      sx={(theme) => {
        const warm = (theme.vars ?? theme).palette.warning.main;
        const white = (theme.vars ?? theme).palette.common.white;

        return {
          position: 'absolute',
          left: `${50 - SPOT.width / 2}%`,
          top: `${50 - SPOT.height / 2 + 2}%`,
          width: `${SPOT.width}%`,
          height: `${SPOT.height}%`,
          borderRadius: '50%',
          filter: 'blur(6px)',
          opacity: 0.6,
          backgroundImage: `radial-gradient(closest-side, ${fadedColor(warm, 0.55)} 0%, ${fadedColor(warm, 0.25)} 60%, transparent 100%)`,
          ...theme.applyStyles('dark', {
            opacity: 0.5,
            backgroundImage: `radial-gradient(closest-side, ${fadedColor(white, 0.5)} 0%, ${fadedColor(warm, 0.2)} 60%, transparent 100%)`,
          }),
        };
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        transformOrigin: `${LAMP.x}% ${LAMP.y}%`,
        animation: `${sway} ${SWAY_SECONDS}s ease-in-out infinite alternate`,
        [ORBIT_REDUCED_MOTION]: { animation: ORBIT_STILL },
        filter: 'blur(5px)',
      }}
    >
      <Box
        sx={(theme) => {
          const warm = (theme.vars ?? theme).palette.warning.main;
          const white = (theme.vars ?? theme).palette.common.white;

          return {
            position: 'absolute',
            inset: 0,
            clipPath: cone,
            opacity: 0.55,
            backgroundImage: `linear-gradient(to bottom, ${fadedColor(warm, 0.45)} ${LAMP.y}%, ${fadedColor(warm, 0.3)} ${POOL.y}%)`,
            ...theme.applyStyles('dark', {
              opacity: 0.5,
              backgroundImage: `linear-gradient(to bottom, ${fadedColor(white, 0.5)} ${LAMP.y}%, ${fadedColor(white, 0.35)} ${POOL.y}%)`,
            }),
          };
        }}
      />
    </Box>
  </>
);
