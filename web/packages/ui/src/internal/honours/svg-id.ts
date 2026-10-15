import type { KkMetalGradient } from './honour-laps';

const UNSAFE = /[^a-zA-Z0-9_-]/g;

export const svgIdOf = (raw: string): string => `kk${raw.replace(UNSAFE, '')}`;

export const metalGradientIdOf = (prefix: string, gradient: KkMetalGradient): string =>
  `${prefix}-${gradient}`;

export const metalFillOf = (prefix: string, gradient: KkMetalGradient): string =>
  `url(#${metalGradientIdOf(prefix, gradient)})`;

export const partIdOf = (prefix: string, part: string): string => `${prefix}-${part}`;

export const urlOf = (id: string): string => `url(#${id})`;
