import { keyframes } from '@mui/material/styles';

export const ORBIT_REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
export const ORBIT_STILL = 'none';

export const orbitTurn = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const orbitTurnBack = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

export const fadedColor = (color: string, share: number): string =>
  `color-mix(in srgb, ${color} calc(${share} * 100%), transparent)`;

export const centredInset = (diameter: number): string => `${(100 - diameter) / 2}%`;

export const ORBIT_TILT = 0.4;
