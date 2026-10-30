import type { KeyboardEvent } from 'react';
import type { RasterSpot } from '../season-raster';
import { movedSpotOf, spotKeyOf, spotOfKey } from '../season-raster';

export const SPOT_ATTRIBUTE = 'data-raster-spot';

const SPACE = ' ';
const ESCAPE = 'Escape';

export interface RasterKeys {
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onKeyUp: (event: KeyboardEvent<HTMLElement>) => void;
}

const spotAt = (event: KeyboardEvent<HTMLElement>): RasterSpot | null => {
  const target = event.target instanceof Element ? event.target : null;
  const holder = target?.closest(`[${SPOT_ATTRIBUTE}]`) ?? null;

  return spotOfKey(holder?.getAttribute(SPOT_ATTRIBUTE) ?? undefined);
};

const focusSpot = (root: HTMLElement, spot: RasterSpot): void => {
  const button = root.querySelector<HTMLElement>(`[${SPOT_ATTRIBUTE}="${spotKeyOf(spot)}"] button`);
  button?.focus();
};

export const useRasterKeys = (
  lines: number,
  columns: number,
  open: (spot: RasterSpot) => void,
  close: () => void,
  follows: boolean,
): RasterKeys => ({
  onKeyDown: (event) => {
    const spot = spotAt(event);
    if (spot === null) {
      return;
    }
    if (event.key === SPACE) {
      event.preventDefault();
      open(spot);
      return;
    }
    if (event.key === ESCAPE) {
      close();
      return;
    }
    const moved = movedSpotOf(spot, event.key, lines, columns);
    if (moved === null) {
      return;
    }
    event.preventDefault();
    focusSpot(event.currentTarget, moved);
    if (follows) {
      open(moved);
    }
  },
  onKeyUp: (event) => {
    if (event.key === SPACE && spotAt(event) !== null) {
      event.preventDefault();
    }
  },
});
