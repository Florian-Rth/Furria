import { useEffect, useState } from 'react';
import { hasPassedTheToolbar } from './letter-position';

export interface LetterAnchor {
  letter: string;
  anchorId: string;
}

export interface LetterPosition {
  letter: string | undefined;
  markLetter: (letter: string) => void;
}

/**
 * The shell publishes its head clearance as the document's `scroll-padding-top`, so every
 * `scrollIntoView` lands below the chrome. Reading that one value back keeps the index in step
 * with the list at every width and through every chrome change, where a constant would only
 * ever be right at the one height it was measured at.
 */
const toBarClearance = (): number =>
  Number.parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

const toCurrentLetter = (anchors: readonly LetterAnchor[]): string | undefined => {
  const barClearance = toBarClearance();
  let current: string | undefined;

  for (const anchor of anchors) {
    const element = document.getElementById(anchor.anchorId);

    if (
      element !== null &&
      hasPassedTheToolbar({
        dividerTop: element.getBoundingClientRect().top,
        dividerHeight: element.offsetHeight,
        barClearance,
      })
    ) {
      current = anchor.letter;
    }
  }

  return current ?? anchors[0]?.letter;
};

export const useLetterPosition = (anchors: readonly LetterAnchor[]): LetterPosition => {
  const [letter, setLetter] = useState<string | undefined>(undefined);

  useEffect(() => {
    let frame = 0;

    const measure = (): void => {
      frame = 0;
      setLetter(toCurrentLetter(anchors));
    };

    const schedule = (): void => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [anchors]);

  return { letter, markLetter: setLetter };
};
