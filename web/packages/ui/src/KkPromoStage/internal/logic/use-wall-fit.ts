import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { wallScaleOf } from './wall-cascade';

const FIT_ROUNDS = 5;

interface WallFit {
  room: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
}

const applyScale = (content: HTMLDivElement, scale: number): void => {
  content.style.transform = `scale(${scale})`;
  content.style.width = `${100 / scale}%`;
};

export const useWallFit = (entryCount: number): WallFit => {
  const room = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const roomElement = room.current;
    const contentElement = content.current;

    if (roomElement === null || contentElement === null || entryCount < 0) {
      return;
    }

    const fit = (): void => {
      let scale = 1;

      applyScale(contentElement, scale);
      for (let round = 0; round < FIT_ROUNDS; round += 1) {
        const next = wallScaleOf(roomElement.clientHeight, contentElement.scrollHeight * scale);

        scale = Math.min(1, scale * next);
        applyScale(contentElement, scale);
      }
    };
    const observer = new ResizeObserver(fit);

    observer.observe(roomElement);
    fit();

    return () => {
      observer.disconnect();
    };
  }, [entryCount]);

  return { room, content };
};
