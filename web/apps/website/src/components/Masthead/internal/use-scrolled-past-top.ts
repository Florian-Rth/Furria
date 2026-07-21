import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD_PX = 8;

export const isPastScrollThreshold = (scrollY: number): boolean => scrollY > SCROLL_THRESHOLD_PX;

export const useScrolledPastTop = (): boolean => {
  const [scrolled, setScrolled] = useState(() => isPastScrollThreshold(window.scrollY));

  useEffect(() => {
    const handleScroll = (): void => setScrolled(isPastScrollThreshold(window.scrollY));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
};
