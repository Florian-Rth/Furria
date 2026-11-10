import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { PROMO_CANVAS } from '../promo-paint';
import { canvasScaleOf } from './canvas-scale';

interface CanvasScale {
  room: RefObject<HTMLDivElement | null>;
  canvas: RefObject<HTMLDivElement | null>;
}

export const useCanvasScale = (): CanvasScale => {
  const room = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const roomElement = room.current;
    const canvasElement = canvas.current;

    if (roomElement === null || canvasElement === null) {
      return;
    }

    const fit = (): void => {
      const scale = canvasScaleOf(
        { width: roomElement.clientWidth, height: roomElement.clientHeight },
        PROMO_CANVAS,
      );

      canvasElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    const observer = new ResizeObserver(fit);

    observer.observe(roomElement);
    fit();

    return () => {
      observer.disconnect();
    };
  }, []);

  return { room, canvas };
};
