import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { snappedColumnOf } from '../season-raster';

export interface RasterScroll {
  headRef: RefObject<HTMLDivElement | null>;
  sideRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  column: number;
  onHeadScroll: () => void;
  onSideScroll: () => void;
  onBodyScroll: () => void;
  previous: () => void;
  next: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

const follow = (target: HTMLDivElement | null, left: number | null, top: number | null): void => {
  if (target === null) {
    return;
  }
  if (left !== null && target.scrollLeft !== left) {
    target.scrollLeft = left;
  }
  if (top !== null && target.scrollTop !== top) {
    target.scrollTop = top;
  }
};

export const useRasterScroll = (columns: number): RasterScroll => {
  const headRef = useRef<HTMLDivElement | null>(null);
  const sideRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [column, setColumn] = useState(0);

  const jumpTo = (target: number): void => {
    const body = bodyRef.current;
    if (body === null || columns === 0) {
      return;
    }
    body.scrollTo({ left: (body.scrollWidth / columns) * target, behavior: 'smooth' });
  };

  return {
    headRef,
    sideRef,
    bodyRef,
    column,
    onHeadScroll: () => {
      follow(bodyRef.current, headRef.current?.scrollLeft ?? null, null);
    },
    onSideScroll: () => {
      follow(bodyRef.current, null, sideRef.current?.scrollTop ?? null);
    },
    onBodyScroll: () => {
      const body = bodyRef.current;
      if (body === null) {
        return;
      }
      follow(headRef.current, body.scrollLeft, null);
      follow(sideRef.current, null, body.scrollTop);
      setColumn(snappedColumnOf(body.scrollLeft, body.scrollWidth, columns));
    },
    previous: () => {
      jumpTo(Math.max(column - 1, 0));
    },
    next: () => {
      jumpTo(Math.min(column + 1, columns - 1));
    },
    canPrevious: column > 0,
    canNext: column < columns - 1,
  };
};
