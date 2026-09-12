import { useEffect, useState } from 'react';

export interface LetterAnchor {
  letter: string;
  anchorId: string;
}

export interface LetterPosition {
  letter: string | undefined;
  markLetter: (letter: string) => void;
}

const PASSED_ABOVE = 220;

const toCurrentLetter = (anchors: readonly LetterAnchor[]): string | undefined => {
  let current: string | undefined;

  for (const anchor of anchors) {
    const element = document.getElementById(anchor.anchorId);

    if (element !== null && element.getBoundingClientRect().top <= PASSED_ABOVE) {
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
