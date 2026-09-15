import { useEffect, useState } from 'react';

export const useTrackScroll = (): number => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = (): void => {
      frame = 0;
      setOffset(window.scrollY);
    };

    const schedule = (): void => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return offset;
};
