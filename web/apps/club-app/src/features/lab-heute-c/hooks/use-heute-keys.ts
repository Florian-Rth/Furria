import { useEffect, useEffectEvent } from 'react';
import { keyIntentOf } from '../heute-c-view';

const CONTROLS = 'button, a, input, textarea, select, [role="button"], [role="checkbox"]';

export const useHeuteKeys = (enabled: boolean, forward: () => void, back: () => void): void => {
  const onKey = useEffectEvent((event: KeyboardEvent): void => {
    const onControl = event.target instanceof Element && event.target.closest(CONTROLS) !== null;
    const intent = keyIntentOf(event.key, onControl);
    if (intent === null || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    event.preventDefault();
    if (intent === 'forward') {
      forward();
    } else {
      back();
    }
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled]);
};
