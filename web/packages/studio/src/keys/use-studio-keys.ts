import { useEffect, useEffectEvent } from 'react';
import type { KeybindingsMap } from 'tinykeys';
import { tinykeys } from 'tinykeys';
import type { KeyFocus, StudioCommand, StudioKeyActions } from './studio-keys';
import { keyDecisionOf, STUDIO_COMMANDS, STUDIO_KEYS } from './studio-keys';

const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const OVERLAY_SELECTOR = '[role="dialog"], [aria-modal="true"], [role="menu"], [role="listbox"]';
const WIDGET_SELECTOR = '[role="slider"], input[type="range"], [role="tab"]';
const CONTROL_SELECTOR =
  'button, a[href], [role="button"], [role="switch"], [role="tab"], [role="checkbox"], [role="radio"], [role="option"], [role="menuitem"]';

const NO_FOCUS: KeyFocus = { typing: false, overlay: false, widget: false, control: false };

const keyFocusOf = (target: EventTarget | null): KeyFocus =>
  target instanceof HTMLElement
    ? {
        typing: target.isContentEditable || TYPING_TAGS.includes(target.tagName),
        overlay: target.closest(OVERLAY_SELECTOR) !== null,
        widget: target.matches(WIDGET_SELECTOR),
        control: target.closest(CONTROL_SELECTOR) !== null,
      }
    : NO_FOCUS;

const boundKeyOf = (actions: StudioKeyActions): string =>
  STUDIO_COMMANDS.filter((command) => Boolean(actions[command])).join(' ');

const ignoreComposing = (event: KeyboardEvent): boolean => event.isComposing;

export const useStudioKeys = (actions: StudioKeyActions, active: boolean): void => {
  const boundKey = active ? boundKeyOf(actions) : '';

  const press = useEffectEvent((command: StudioCommand, event: KeyboardEvent): void => {
    const action = actions[command];
    if (!action || event.defaultPrevented) {
      return;
    }
    const decision = keyDecisionOf(command, keyFocusOf(event.target), event.repeat);
    if (decision === 'pass') {
      return;
    }
    event.preventDefault();
    if (decision === 'run') {
      action();
    }
  });

  useEffect(() => {
    if (boundKey === '') {
      return;
    }
    const bound = boundKey.split(' ');
    const map: KeybindingsMap = {};
    for (const command of STUDIO_COMMANDS.filter((candidate) => bound.includes(candidate))) {
      for (const binding of STUDIO_KEYS[command].bindings) {
        map[binding] = (event: KeyboardEvent): void => {
          press(command, event);
        };
      }
    }

    return tinykeys(window, map, { ignore: ignoreComposing });
  }, [boundKey]);
};
