import { useEffect, useEffectEvent } from 'react';
import type { KeyFocus } from '@/features/act-practice/practice-keys';
import { practiceCommandOf } from '@/features/act-practice/practice-keys';

const TEXT_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROL_SELECTOR = 'button, a[href], [role="button"], [role="slider"], [role="tab"]';
const OVERLAY_SELECTOR = '[role="dialog"], [aria-modal="true"], [role="menu"]';

const focusOf = (target: EventTarget | null): KeyFocus | null => {
  if (!(target instanceof HTMLElement)) {
    return 'none';
  }
  if (target.closest(OVERLAY_SELECTOR) !== null) {
    return null;
  }
  if (target.isContentEditable || TEXT_TAGS.includes(target.tagName)) {
    return 'text';
  }

  return target.closest(CONTROL_SELECTOR) === null ? 'none' : 'control';
};

export const useScoreKeys = (active: boolean, toggle: () => void): void => {
  const perform = useEffectEvent((): void => {
    toggle();
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    const press = (event: KeyboardEvent): void => {
      const focus = focusOf(event.target);
      if (focus === null || event.defaultPrevented || event.repeat) {
        return;
      }
      const command = practiceCommandOf({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        focus,
      });
      if (command !== 'toggle') {
        return;
      }
      event.preventDefault();
      perform();
    };

    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [active]);
};
