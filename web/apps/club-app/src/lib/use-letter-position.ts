import { useEffect, useState } from 'react';

export interface LetterAnchor {
  letter: string;
  anchorId: string;
}

export interface LetterPosition {
  letter: string | undefined;
  markLetter: (letter: string) => void;
}

const OBSERVER_MARGIN = '-170px 0px -55% 0px';

export const useLetterPosition = (anchors: readonly LetterAnchor[]): LetterPosition => {
  const [letter, setLetter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const intersecting = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersecting.set(entry.target.id, entry.isIntersecting);
        }

        const active = anchors.find((anchor) => intersecting.get(anchor.anchorId) === true);

        if (active !== undefined) {
          setLetter(active.letter);
        }
      },
      { rootMargin: OBSERVER_MARGIN },
    );

    for (const anchor of anchors) {
      const element = document.getElementById(anchor.anchorId);

      if (element !== null) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [anchors]);

  return { letter, markLetter: setLetter };
};
