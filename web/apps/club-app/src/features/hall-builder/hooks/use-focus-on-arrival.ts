import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useFocusOnArrival = (key: string): RefObject<HTMLInputElement | null> => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => cancelAnimationFrame(frame);
  }, [key]);

  return inputRef;
};
