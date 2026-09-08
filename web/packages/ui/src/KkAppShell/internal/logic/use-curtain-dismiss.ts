import { useEffect } from 'react';

export const useCurtainDismiss = (isOpen: boolean, close: () => void): void => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dismissOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', dismissOnEscape);

    return () => {
      window.removeEventListener('keydown', dismissOnEscape);
    };
  }, [isOpen, close]);
};
