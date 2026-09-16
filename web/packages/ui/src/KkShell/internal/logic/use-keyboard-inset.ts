import { useEffect, useState } from 'react';
import { keyboardInsetOf } from './keyboard-inset';

const NO_INSET = 0;

export const useKeyboardInset = (): number => {
  const [inset, setInset] = useState(NO_INSET);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (viewport === null) {
      return;
    }

    const measure = (): void => {
      setInset(
        keyboardInsetOf({
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

  return inset;
};
