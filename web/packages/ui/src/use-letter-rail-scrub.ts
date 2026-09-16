import type { PointerEvent, RefObject } from 'react';
import { useState } from 'react';
import type { KkLetterRailBand } from './letter-rail-scrub';
import { railIndexAt } from './letter-rail-scrub';

const CELL_SELECTOR = '[data-kk-letter-index-cell]';
const FIRST = 0;
const NOTHING_HELD = null;

export interface KkLetterRailScrub {
  held: number | null;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}

const bandOf = (rail: HTMLDivElement | null): KkLetterRailBand | null => {
  const cells = rail?.querySelectorAll(CELL_SELECTOR) ?? [];
  const first = cells[FIRST];
  const last = cells[cells.length - 1];

  if (first === undefined || last === undefined) {
    return null;
  }

  return {
    top: first.getBoundingClientRect().top,
    bottom: last.getBoundingClientRect().bottom,
    count: cells.length,
  };
};

export const useLetterRailScrub = (
  railRef: RefObject<HTMLDivElement | null>,
  onReach: (index: number) => void,
  enabled: boolean,
): KkLetterRailScrub => {
  const [held, setHeld] = useState<number | null>(NOTHING_HELD);
  const [band, setBand] = useState<KkLetterRailBand | null>(null);

  const reach = (measured: KkLetterRailBand, y: number): void => {
    const index = railIndexAt(y, measured);

    if (index !== held) {
      setHeld(index);
      onReach(index);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (!enabled) {
      return;
    }

    const measured = bandOf(railRef.current);

    if (measured === null) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setBand(measured);
    reach(measured, event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (band === null) {
      return;
    }

    reach(band, event.clientY);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setBand(null);
    setHeld(NOTHING_HELD);
  };

  return { held, onPointerDown, onPointerMove, onPointerUp };
};
