import { useEffect, useEffectEvent } from 'react';

const ESCAPE_KEY = 'Escape';

export const useCloseOnEscape = (isActive: boolean, close: () => void): void => {
  const onEscape = useEffectEvent(close);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === ESCAPE_KEY) {
        onEscape();
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isActive]);
};
