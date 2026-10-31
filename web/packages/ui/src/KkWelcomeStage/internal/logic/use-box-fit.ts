import { useLayoutEffect, useRef } from 'react';
import type { StageFitBounds } from './stage-fit';
import { stageScaleOf } from './stage-fit';
import type { StageFit } from './use-width-fit';

export const useBoxFit = (bounds: StageFitBounds, headroom: number): StageFit => {
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
      const faceHeight = faceElement.offsetHeight * headroom;
      const scale = stageScaleOf(
        { width: roomElement.clientWidth, height: roomElement.clientHeight },
        { width: faceElement.offsetWidth, height: faceHeight },
        { least, most },
      );
      const drop = Math.max(roomElement.clientHeight - faceHeight * scale, 0);

      faceElement.style.transform = `translateY(${drop}px) scale(${scale})`;
    };
    const observer = new ResizeObserver(fit);

    observer.observe(roomElement);
    observer.observe(faceElement);
    fit();

    return () => {
      observer.disconnect();
    };
  }, [least, most, headroom]);

  return { room, face };
};
