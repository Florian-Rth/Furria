import type { FocusEvent, KeyboardEvent, RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

export interface LineExpansion {
  lineRef: RefObject<HTMLLIElement | null>;
  hasOpened: boolean;
  enter: () => void;
  leave: (event: FocusEvent<HTMLElement>) => void;
  dismiss: (event: KeyboardEvent<HTMLElement>) => void;
}

const DISMISS_KEY = 'Escape';
const EXPANDED_TARGET = '[data-kk-dense-expanded] :is(button, a, input):not(:disabled)';
const TRAILING_TARGET = '[data-kk-dense-trailing] :is(button, a):not(:disabled)';
const FACT_TARGET = ':is(button, a)[data-kk-dense-fact]';

const leftTheLine = (line: HTMLElement | null, target: EventTarget | null): boolean =>
  line !== null && target instanceof Node && !line.contains(target);

const focusWasDropped = (line: HTMLElement): boolean => {
  const active = document.activeElement;

  return active === null || active === document.body || line.contains(active);
};

const returnTargetOf = (line: HTMLElement): HTMLElement | null =>
  line.querySelector<HTMLElement>(TRAILING_TARGET) ?? line.querySelector<HTMLElement>(FACT_TARGET);

export const useLineExpansion = (
  expanded: boolean,
  onCollapse: (() => void) | undefined,
): LineExpansion => {
  const lineRef = useRef<HTMLLIElement>(null);
  const focusInside = useRef(false);
  const wasExpanded = useRef(expanded);
  const [hasOpened, setHasOpened] = useState(expanded);

  if (expanded && !hasOpened) {
    setHasOpened(true);
  }

  useLayoutEffect(() => {
    const opened = !wasExpanded.current && expanded;
    const collapsed = wasExpanded.current && !expanded;
    const line = lineRef.current;
    wasExpanded.current = expanded;

    if (line === null) {
      return;
    }

    if (opened && focusWasDropped(line)) {
      line.querySelector<HTMLElement>(EXPANDED_TARGET)?.focus();
    }

    if (!collapsed || !focusInside.current) {
      return;
    }

    focusInside.current = false;

    if (focusWasDropped(line)) {
      returnTargetOf(line)?.focus();
    }
  }, [expanded]);

  const enter = (): void => {
    focusInside.current = true;
  };

  const leave = (event: FocusEvent<HTMLElement>): void => {
    if (!leftTheLine(lineRef.current, event.relatedTarget)) {
      return;
    }

    focusInside.current = false;
    onCollapse?.();
  };

  const dismiss = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== DISMISS_KEY || onCollapse === undefined) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onCollapse();
  };

  return { lineRef, hasOpened, enter, leave, dismiss };
};
