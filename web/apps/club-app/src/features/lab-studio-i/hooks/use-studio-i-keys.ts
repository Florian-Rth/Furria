import { useEffect } from 'react';
import type { StudioITransport } from './use-studio-i-transport';

const TYPING = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

interface StudioIKeyActions {
  transport: StudioITransport;
  clear: () => void;
}

export const useStudioIKeys = ({ transport, clear }: StudioIKeyActions): void => {
  useEffect(() => {
    const listen = (event: KeyboardEvent): void => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (TYPING.has(target.tagName) || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        transport.back();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        transport.forward();
      } else if (event.key === ' ' && !(target instanceof HTMLButtonElement)) {
        event.preventDefault();
        transport.toggle();
      } else if (event.key === 'Escape') {
        clear();
      }
    };
    window.addEventListener('keydown', listen);
    return () => {
      window.removeEventListener('keydown', listen);
    };
  }, [transport, clear]);
};
