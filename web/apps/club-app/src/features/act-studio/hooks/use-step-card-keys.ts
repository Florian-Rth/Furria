import { useEffect } from 'react';
import type { StepCardKey } from '../step-cards';
import { neighbourCountOf, stepCardKeyOf } from '../step-cards';
import type { StudioScreen } from './use-studio-screen';

const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const CONTROL_SELECTOR =
  'button, a, [role="button"], [role="slider"], [role="tab"], [role="menuitem"], [role="option"], [role="checkbox"], [role="switch"]';
const WIDGET_SELECTOR = '[role="slider"], [role="tab"], [role="listbox"], [role="menu"]';

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

const isWithin = (target: EventTarget | null, selector: string): boolean =>
  target instanceof HTMLElement && target.closest(selector) !== null;

export const useStepCardKeys = (screen: StudioScreen, enabled: boolean): void => {
  const { practice, playback } = screen;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const seekCount = (direction: 1 | -1): void => {
      const target = neighbourCountOf(playback.countMarks, playback.player.position(), direction);
      if (target !== null) {
        playback.player.seek(target);
      }
    };
    const actions: Record<StepCardKey, () => void> = {
      toggle: practice.toggle,
      stepBack: () => {
        practice.skip('back');
      },
      stepForward: () => {
        practice.skip('forward');
      },
      countBack: () => {
        seekCount(-1);
      },
      countForward: () => {
        seekCount(1);
      },
    };
    const press = (event: KeyboardEvent): void => {
      const key = stepCardKeyOf({
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        repeat: event.repeat,
        typing: isTyping(event.target),
        onControl: isWithin(event.target, CONTROL_SELECTOR),
        onWidget: isWithin(event.target, WIDGET_SELECTOR),
      });
      if (key === null || event.defaultPrevented) {
        return;
      }
      event.preventDefault();
      actions[key]();
    };
    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [practice, playback, enabled]);
};
