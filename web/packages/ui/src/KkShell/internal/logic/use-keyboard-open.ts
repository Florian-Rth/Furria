import { useEffect, useState } from 'react';
import { isKeyboardOpen } from './keyboard-inset';

export const useKeyboardOpen = (): boolean => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (viewport === null) {
      return;
    }

    const measure = (): void => {
      setOpen(
        isKeyboardOpen({
          innerHeight: window.innerHeight,
          viewportHeight: viewport.height,
          offsetTop: viewport.offsetTop,
        }),
      );
    };

    measure();
    viewport.addEventListener('resize', measure);
    viewport.addEventListener('scroll', measure);

    return () => {
      viewport.removeEventListener('resize', measure);
      viewport.removeEventListener('scroll', measure);
    };
  }, []);

  return open;
};
