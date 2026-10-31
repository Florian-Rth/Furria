import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export type WelcomePlate = 'red' | 'ink' | 'gold';

export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
export const KK_WELCOME_LEAVE_MS = 900;

const LAND_MS = 900;
const LIFT_MS = 640;
const STILL_FADE_MS = 400;
const LIFT_EASE = 'cubic-bezier(0.55, 0, 1, 0.45)';

const OFF_REGISTER: Record<WelcomePlate, readonly [string, string]> = {
  red: ['6px', '4px'],
  ink: ['-4px', '-5px'],
  gold: ['4px', '-5px'],
};

const LIFT_OFF: Record<WelcomePlate, readonly [string, string]> = {
  red: ['12px', '-36px'],
  ink: ['-12px', '28px'],
  gold: ['0px', '-14px'],
};

const LIFT_DELAY_MS: Record<WelcomePlate, number> = { red: 0, ink: 60, gold: 160 };

const plateLand = keyframes`
  0% {
    opacity: 0;
    transform: translate(var(--kk-welcome-dx), var(--kk-welcome-dy));
  }
  35% {
    opacity: 1;
    transform: translate(var(--kk-welcome-dx), var(--kk-welcome-dy));
    animation-timing-function: cubic-bezier(0.75, 0, 0.25, 1);
  }
  65% {
    transform: translate(calc(var(--kk-welcome-dx) * -0.18), calc(var(--kk-welcome-dy) * -0.18));
  }
  80%, 100% {
    opacity: 1;
    transform: none;
  }
`;

const liftOff = keyframes`
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translate(var(--kk-welcome-lift-x), var(--kk-welcome-lift-y));
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const plateRunOf = (plate: WelcomePlate, atMs: number, leaving: boolean): CSSObject => {
  const [dx, dy] = OFF_REGISTER[plate];
  const [liftX, liftY] = LIFT_OFF[plate];

  return {
    '--kk-welcome-dx': dx,
    '--kk-welcome-dy': dy,
    '--kk-welcome-lift-x': liftX,
    '--kk-welcome-lift-y': liftY,
    animation: leaving
      ? `${liftOff} ${LIFT_MS}ms ${LIFT_EASE} ${LIFT_DELAY_MS[plate]}ms both`
      : `${plateLand} ${LAND_MS}ms linear ${atMs}ms both`,
    [REDUCED_MOTION]: {
      animation: leaving ? `${fadeOut} ${STILL_FADE_MS}ms ease both` : 'none',
    },
  };
};

export const plateLiftOf = (plate: WelcomePlate, leaving: boolean): CSSObject =>
  leaving ? plateRunOf(plate, 0, true) : {};

const halftoneOf = (gold: string): CSSObject => ({
  backgroundImage: `radial-gradient(circle, ${gold} 44%, transparent 48%)`,
});

export const goldHalftoneOf = (theme: Theme): CSSObject => ({
  color: 'transparent',
  backgroundSize: '0.045em 0.045em',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  ...halftoneOf(kkTokens.color.light.gold),
  ...theme.applyStyles('dark', halftoneOf(kkTokens.color.dark.gold)),
});
