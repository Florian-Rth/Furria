import { useEffect } from 'react';

interface StudioFKeys {
  canPlay: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest('input, textarea, select, button, [role="radio"], [role="switch"]') !== null);

export const useStudioFKeys = ({ canPlay, onToggle, onPrevious, onNext }: StudioFKeys): void => {
  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTyping(event.target)) {
        return;
      }
      if (event.key === ' ' && canPlay) {
        event.preventDefault();
        onToggle();
      } else if (event.key === 'ArrowLeft') {
        onPrevious();
      } else if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', press);
    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [canPlay, onToggle, onPrevious, onNext]);
};
