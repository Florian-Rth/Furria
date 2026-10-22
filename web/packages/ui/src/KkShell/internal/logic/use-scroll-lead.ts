import { useEffect, useRef } from 'react';

const LEADING_INPUTS = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
const LISTENING: AddEventListenerOptions = { capture: true, passive: true };

export const useScrollLead = (path: string): (() => boolean) => {
  const arrivedOnRef = useRef(path);
  const ledRef = useRef(false);

  useEffect(() => {
    arrivedOnRef.current = path;
    ledRef.current = false;
  }, [path]);

  useEffect(() => {
    const lead = (): void => {
      ledRef.current = true;
    };

    for (const input of LEADING_INPUTS) {
      window.addEventListener(input, lead, LISTENING);
    }

    return () => {
      for (const input of LEADING_INPUTS) {
        window.removeEventListener(input, lead, LISTENING);
      }
    };
  }, []);

  return () => ledRef.current && arrivedOnRef.current === path;
};
