import { animate } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { kkTokens } from '../../../tokens';

const { morphSeconds, morphEase } = kkTokens.calendarStrip;
const AUTO = 'auto';

export interface FaceMorph {
  frame: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
}

export const useFaceMorph = (face: string, reduced: boolean): FaceMorph => {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const settled = useRef<number | null>(null);
  const shownFace = useRef(face);

  useEffect(() => {
    const node = content.current;

    if (node === null) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      settled.current = node.offsetHeight;
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const box = frame.current;
    const node = content.current;

    if (box === null || node === null || shownFace.current === face) {
      return undefined;
    }

    shownFace.current = face;

    const from = settled.current;
    const to = node.offsetHeight;

    settled.current = to;

    if (from === null || from === to || reduced) {
      return undefined;
    }

    box.style.height = `${from}px`;

    let stop: (() => void) | null = null;
    const frameId = requestAnimationFrame(() => {
      const controls = animate(
        box,
        { height: [`${from}px`, `${to}px`] },
        { duration: morphSeconds, ease: morphEase },
      );
      stop = () => {
        controls.stop();
      };
      void controls.then(() => {
        box.style.height = AUTO;
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      stop?.();
      box.style.height = AUTO;
    };
  }, [face, reduced]);

  return { frame, content };
};
