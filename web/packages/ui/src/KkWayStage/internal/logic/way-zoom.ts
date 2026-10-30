import type { CSSObject } from '@mui/material/styles';

export const WAY_ZOOM_PROPERTY = '--kk-way-zoom';

export const WAY_ZOOM_REGISTRATION: CSSObject = {
  [`@property ${WAY_ZOOM_PROPERTY}`]: {
    syntax: '"<number>"',
    inherits: 'true',
    initialValue: '1',
  },
};

export const WAY_CAMERA_GLIDE = '900ms cubic-bezier(0.22, 0.61, 0.36, 1)';

export const unzoomed = (size: string): string => `calc(${size} / var(${WAY_ZOOM_PROPERTY}, 1))`;

export const UNZOOMED_SCALE = `calc(1 / var(${WAY_ZOOM_PROPERTY}, 1))`;

export const PERCENT = 100;

export const FRONT_ROOM = '2.75rem';

export const placeAt = (x: number, y: number): { transform: string } => ({
  transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
});
