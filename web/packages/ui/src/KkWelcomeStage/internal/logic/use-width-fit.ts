import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import type { StageFitBounds } from './stage-fit';
import { stageScaleOf } from './stage-fit';

export interface StageFit {
  room: RefObject<HTMLDivElement | null>;
  face: RefObject<HTMLDivElement | null>;
}

export const useWidthFit = (bounds: StageFitBounds, screenShare: number): StageFit => {
  const room = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const { least, most } = bounds;

  useLayoutEffect(() => {
    const roomElement = room.current;
    const faceElement = face.current;

    if (roomElement === null || faceElement === null) {
      return;
    }

    const fit = (): void => {
      const scale = stageScaleOf(
        { width: roomElement.clientWidth, height: window.innerHeight * screenShare },
        { width: faceElement.offsetWidth, height: faceElement.offsetHeight },
        { least, most },
      );

      faceElement.style.transform = `scale(${scale})`;
      roomElement.style.height = `${faceElement.offsetHeight * scale}px`;
    };
    const observer = new ResizeObserver(fit);

    observer.observe(roomElement);
    observer.observe(faceElement);
    window.addEventListener('resize', fit);
    fit();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [least, most, screenShare]);

  return { room, face };
};
