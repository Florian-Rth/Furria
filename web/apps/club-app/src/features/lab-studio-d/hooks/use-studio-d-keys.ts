import { useEffect } from 'react';

const PLAY_KEY = ' ';

export const useStudioDKeys = (toggle: () => void): void => {
  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      if (event.key !== PLAY_KEY || event.repeat) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('button, input, textarea') !== null) {
        return;
      }
      event.preventDefault();
      toggle();
    };

    window.addEventListener('keydown', press);
    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [toggle]);
};
