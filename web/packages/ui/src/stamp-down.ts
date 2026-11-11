import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { REDUCED_MOTION } from './KkWelcomeStage/internal/welcome-paint';

const STAMP_MS = 420;
const JOLT_MS = 280;

const stampDown = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.7) rotate(-4deg);
  }
  55% {
    opacity: 1;
    transform: scale(0.95) rotate(0deg);
  }
  78% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

export const stampDownOf = (atMs: number): CSSObject => ({
  display: 'block',
  transformOrigin: 'left center',
  animation: `${stampDown} ${STAMP_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${atMs}ms both`,
  [REDUCED_MOTION]: { animation: 'none' },
});

const jolt = keyframes`
  0% {
    transform: none;
  }
  25% {
    transform: translate(0, 7px) rotate(-0.4deg);
  }
  55% {
    transform: translate(0, -4px) rotate(0.3deg);
  }
  80% {
    transform: translate(0, 2px);
  }
  100% {
    transform: none;
  }
`;

export const stampJoltOf = (atMs: number): CSSObject => ({
  animation: `${jolt} ${JOLT_MS}ms ease-out ${atMs}ms both`,
  [REDUCED_MOTION]: { animation: 'none' },
});
