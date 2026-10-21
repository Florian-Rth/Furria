import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { countScaleOf } from './count-fit';

export interface CountFit {
  room: RefObject<HTMLDivElement | null>;
  face: RefObject<HTMLDivElement | null>;
}

const verticalMarginOf = (element: HTMLElement): number => {
  const style = getComputedStyle(element);

  return Number.parseFloat(style.marginTop) + Number.parseFloat(style.marginBottom);
};

export const useCountFit = (): CountFit => {
  const room = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const roomElement = room.current;
    const faceElement = face.current;

    if (roomElement === null || faceElement === null) {
      return;
    }

    const fit = (): void => {
      const scale = countScaleOf(
        roomElement.clientHeight - verticalMarginOf(faceElement),
        faceElement.offsetHeight,
      );

      faceElement.style.transform = `scale(${scale})`;
      roomElement.style.width = `${faceElement.offsetWidth * scale}px`;
    };
    const observer = new ResizeObserver(fit);

    observer.observe(roomElement);
    observer.observe(faceElement);
    fit();

    return () => {
      observer.disconnect();
    };
  }, []);

  return { room, face };
};
