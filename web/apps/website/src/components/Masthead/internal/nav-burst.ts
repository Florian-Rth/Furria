import type { OriginRect } from './reveal-geometry';

export interface NavBurstOrigin {
  x: number;
  y: number;
}

export interface NavBurst extends NavBurstOrigin {
  fireKey: number;
}

export const resolveNavBurstOrigin = (chip: OriginRect, masthead: OriginRect): NavBurstOrigin => ({
  x: chip.left - masthead.left + chip.width / 2,
  y: chip.top - masthead.top + chip.height / 2,
});
