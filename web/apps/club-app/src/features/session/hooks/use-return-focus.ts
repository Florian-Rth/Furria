import type { RefObject } from 'react';
import { useRef } from 'react';

const RECLAIM_WINDOW_MS = 500;

export interface ReturnFocus {
  targetRef: RefObject<HTMLHeadingElement | null>;
  returnFocus: () => void;
}

/**
 * A confirmed „… beenden" unmounts the row its button sat in, so the closing dialog restores
 * focus to a node that is no longer in the document and the keyboard lands on `<body>` at the
 * top of the page (SC 2.4.3). Claiming the panel's heading is therefore not one call: the open
 * dialog still traps focus, and its exit transition hands focus back afterwards. The heading is
 * taken once and then taken back for as long as the closing dialog keeps dropping it on the
 * body — never off a control the reader has moved to herself.
 */
export const useReturnFocus = (): ReturnFocus => {
  const targetRef = useRef<HTMLHeadingElement>(null);

  const returnFocus = (): void => {
    const target = targetRef.current;

    if (target === null) {
      return;
    }

    const deadline = Date.now() + RECLAIM_WINDOW_MS;

    const reclaim = (): void => {
      if (document.activeElement === document.body) {
        target.focus();
      }
      if (Date.now() < deadline) {
        window.requestAnimationFrame(reclaim);
      }
    };

    target.focus();
    window.requestAnimationFrame(reclaim);
  };

  return { targetRef, returnFocus };
};
