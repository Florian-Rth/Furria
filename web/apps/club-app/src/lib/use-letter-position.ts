import { useEffect, useState } from 'react';

export interface LetterAnchor {
  letter: string;
  anchorId: string;
}

export interface LetterPosition {
  letter: string | undefined;
  markLetter: (letter: string) => void;
}

/**
 * A divider sticks at the toolbar's measured height, which `KkLetterDivider` resolves
 * from the same custom property the toolbar publishes. Reading the resolved offset back
 * off the element keeps the index in step with the list at every breakpoint — a constant
 * here is only ever right at the one width it was measured at.
 *
 * The letter the reader is in is the one whose *rows* sit under the toolbar, so a divider
 * counts as passed one divider-height early: at that point the section above it has been
 * pushed out completely and this one is taking the clearance line.
 */
const hasPassedTheToolbar = (element: HTMLElement): boolean => {
  const clearance = Number.parseFloat(window.getComputedStyle(element).top) || 0;

  return element.getBoundingClientRect().top <= clearance + element.offsetHeight;
};

const toCurrentLetter = (anchors: readonly LetterAnchor[]): string | undefined => {
  let current: string | undefined;

  for (const anchor of anchors) {
    const element = document.getElementById(anchor.anchorId);

    if (element !== null && hasPassedTheToolbar(element)) {
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
