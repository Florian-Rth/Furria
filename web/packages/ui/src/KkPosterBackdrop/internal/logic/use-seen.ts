import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

const SEEN_SHARE = 0.35;

export const useSeen = (ref: RefObject<HTMLElement | null>): boolean => {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (element === null || seen) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
        }
      },
      { threshold: SEEN_SHARE },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, seen]);

  return seen;
};
