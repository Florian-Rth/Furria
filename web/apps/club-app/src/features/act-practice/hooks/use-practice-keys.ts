import { useEffect, useEffectEvent } from 'react';
import type { KeyFocus, PracticeCommand } from '../practice-keys';
import { practiceCommandOf, steppedRateOf } from '../practice-keys';
import type { Practice } from './use-practice';

const TEXT_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROL_SELECTOR =
  'button, a[href], [role="button"], [role="switch"], [role="tab"], [role="checkbox"], [role="radio"], [role="option"], [role="menuitem"]';
const SLIDER_SELECTOR = '[role="slider"], input[type="range"]';
const OVERLAY_SELECTOR = '[role="dialog"], [aria-modal="true"], [role="menu"], [role="listbox"]';
const REPEATABLE: readonly PracticeCommand[] = ['back', 'forward', 'faster', 'slower'];

const focusOf = (target: EventTarget | null): KeyFocus | null => {
  if (!(target instanceof HTMLElement)) {
    return 'none';
  }
  if (target.closest(OVERLAY_SELECTOR) !== null) {
    return null;
  }
  if (target.matches(SLIDER_SELECTOR)) {
    return 'slider';
  }
  if (target.isContentEditable || TEXT_TAGS.includes(target.tagName)) {
    return 'text';
  }

  return target.closest(CONTROL_SELECTOR) === null ? 'none' : 'control';
};

export const usePracticeKeys = (
  active: boolean,
  practice: Practice,
  rates: readonly number[],
  loop: () => void,
): void => {
  const perform = useEffectEvent((command: PracticeCommand): void => {
    if (command === 'toggle') {
      practice.toggle();
      return;
    }
    if (command === 'back' || command === 'forward') {
      practice.skip(command);
      return;
    }
    if (command === 'faster' || command === 'slower') {
      practice.setRate(steppedRateOf(rates, practice.rate, command));
      return;
    }
    loop();
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    const press = (event: KeyboardEvent): void => {
      const focus = focusOf(event.target);
      if (focus === null || event.defaultPrevented) {
        return;
      }
      const command = practiceCommandOf({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        focus,
      });
      if (command === null) {
        return;
      }
      event.preventDefault();
      if (!event.repeat || REPEATABLE.includes(command)) {
        perform(command);
      }
    };

    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [active]);
};
