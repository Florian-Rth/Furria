import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { REDUCED_MOTION } from '../../internal/print-in/print-stamp';
import { applyScheme } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';
import type { PosterPlate } from './logic/poster-composition';

const { light, dark } = kkTokens.color;

interface SchemePair<TValue> {
  light: TValue;
  dark: TValue;
}

const PLATE_COLOR: Record<PosterPlate, SchemePair<string>> = {
  red: { light: light.red, dark: dark.red },
  ink: { light: light.ink, dark: dark.ink },
  gold: { light: light.gold, dark: dark.gold },
};

const ASHEN_COLOR: SchemePair<string> = { light: light.sub, dark: dark.sub };

const BASE_OPACITY: Record<PosterPlate, SchemePair<number>> = {
  red: { light: 0.5, dark: 0.42 },
  ink: { light: 0.34, dark: 0.26 },
  gold: { light: 0.6, dark: 0.5 },
};

const OFF_REGISTER: Record<PosterPlate, readonly [string, string]> = {
  red: ['6px', '4px'],
  ink: ['-4px', '-5px'],
  gold: ['4px', '-5px'],
};

const LAND_DELAY_MS: Record<PosterPlate, number> = { red: 60, ink: 0, gold: 160 };

export const PLATE_ANGLE: Record<PosterPlate, number> = { red: 15, ink: 45, gold: 75 };

const LAND_MS = 980;
const GOLD_GLOW = `drop-shadow(0 0 3px ${dark.gold})`;
const FULL = 1;

const registerLand = keyframes`
  0% {
    opacity: 0;
    transform: translate(var(--kk-plate-dx), var(--kk-plate-dy));
  }
  30% {
    opacity: 1;
    transform: translate(var(--kk-plate-dx), var(--kk-plate-dy));
    animation-timing-function: cubic-bezier(0.75, 0, 0.25, 1);
  }
  62% {
    transform: translate(calc(var(--kk-plate-dx) * -0.18), calc(var(--kk-plate-dy) * -0.18));
  }
  78%, 100% {
    opacity: 1;
    transform: none;
  }
`;

export const PLATE_FRAME: CSSObject = { position: 'absolute', inset: 0 };

export interface PlateInking {
  plate: PosterPlate;
  amount: number;
  ashen: boolean;
  glow: boolean;
}

export const platePaintOf =
  ({ plate, amount, ashen, glow }: PlateInking) =>
  (theme: Theme): CSSObject => {
    const color = ashen && plate === 'ink' ? ASHEN_COLOR : PLATE_COLOR[plate];
    const base = BASE_OPACITY[plate];
    const glows = glow && plate === 'gold';

    return {
      ...PLATE_FRAME,
      ...applyScheme(theme, {
        light: { color: color.light, opacity: Math.min(base.light * amount, FULL) },
        dark: {
          color: color.dark,
          opacity: Math.min(base.dark * amount, FULL),
          filter: glows ? GOLD_GLOW : 'none',
        },
      }),
    };
  };

export type PlateLanding = 'landing' | 'held' | 'landed';

export const plateLandOf = (plate: PosterPlate, landing: PlateLanding): CSSObject => {
  const [dx, dy] = OFF_REGISTER[plate];

  return {
    ...PLATE_FRAME,
    '--kk-plate-dx': dx,
    '--kk-plate-dy': dy,
    animation:
      landing === 'landed'
        ? 'none'
        : `${registerLand} ${LAND_MS}ms linear ${LAND_DELAY_MS[plate]}ms both`,
    animationPlayState: landing === 'held' ? 'paused' : 'running',
    [REDUCED_MOTION]: { animation: 'none' },
  };
};
