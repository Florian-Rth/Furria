import { useEffect, useEffectEvent } from 'react';
import type { PlannerKeyCommand } from '../planner-keys';
import { plannerKeyCommandOf } from '../planner-keys';

const FIELD_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];

const isField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || FIELD_TAGS.includes(target.tagName));

export const usePlannerKeys = (run: (command: PlannerKeyCommand) => void): void => {
  const onKey = useEffectEvent((event: KeyboardEvent): void => {
    const command = plannerKeyCommandOf({
      key: event.key,
      mod: event.ctrlKey || event.metaKey,
      shift: event.shiftKey,
      inField: isField(event.target),
    });
    if (command === null) {
      return;
    }
    event.preventDefault();
    run(command);
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      onKey(event);
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);
};
