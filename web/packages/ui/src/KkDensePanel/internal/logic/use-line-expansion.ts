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
const PANEL = '[data-kk-dense-panel]';
const PANEL_HEADING = '[data-kk-dense-heading]';
const INERT = '[inert]';

const leftTheLine = (line: HTMLElement | null, target: EventTarget | null): boolean =>
  line !== null && target instanceof Node && !line.contains(target);

const focusWasDropped = (line: HTMLElement): boolean => {
  const active = document.activeElement;

  return active === null || active === document.body || line.contains(active);
};

const isReachable = (target: HTMLElement | null): target is HTMLElement =>
  target !== null && target.closest(INERT) === null;

const siblingsOf = (line: Element, step: (from: Element) => Element | null): Element[] => {
  const siblings: Element[] = [];

  for (let sibling = step(line); sibling !== null; sibling = step(sibling)) {
    siblings.push(sibling);
  }

  return siblings;
};

const neighbourTargetOf = (line: HTMLElement): HTMLElement | null => {
  const neighbours = [
    ...siblingsOf(line, (from) => from.nextElementSibling),
    ...siblingsOf(line, (from) => from.previousElementSibling),
  ];
  const fact = neighbours
    .map((neighbour) => neighbour.querySelector<HTMLElement>(FACT_TARGET))
    .find(isReachable);

  return fact ?? line.closest(PANEL)?.querySelector<HTMLElement>(PANEL_HEADING) ?? null;
};

const returnTargetOf = (line: HTMLElement): HTMLElement | null => {
  const own = [
    line.querySelector<HTMLElement>(TRAILING_TARGET),
    line.querySelector<HTMLElement>(FACT_TARGET),
  ].find(isReachable);

  return own ?? neighbourTargetOf(line);
};

export const useLineExpansion = (
  expanded: boolean,
  inert: boolean,
  onCollapse: (() => void) | undefined,
): LineExpansion => {
  const lineRef = useRef<HTMLLIElement>(null);
  const focusInside = useRef(false);
  const wasExpanded = useRef(expanded);
  const wasInert = useRef(inert);
  const [hasOpened, setHasOpened] = useState(expanded);

  if (expanded && !hasOpened) {
    setHasOpened(true);
  }

  useLayoutEffect(() => {
    const opened = !wasExpanded.current && expanded;
    const collapsed = wasExpanded.current && !expanded;
    const turnedInert = !wasInert.current && inert;
    const line = lineRef.current;
    wasExpanded.current = expanded;
    wasInert.current = inert;

    if (line === null) {
      return;
    }

    if (opened && focusWasDropped(line)) {
      line.querySelector<HTMLElement>(EXPANDED_TARGET)?.focus();
    }

    if (!collapsed && !turnedInert) {
      return;
    }

    if (focusInside.current && focusWasDropped(line)) {
      returnTargetOf(line)?.focus();
    }

    focusInside.current = line.contains(document.activeElement);
  }, [expanded, inert]);

  const enter = (): void => {
    focusInside.current = true;
  };

  const leave = (event: FocusEvent<HTMLElement>): void => {
    const target = event.relatedTarget;

    if (target === null && expanded) {
      return;
    }
    if (target !== null && !leftTheLine(lineRef.current, target)) {
      return;
    }

    focusInside.current = false;

    if (expanded) {
      onCollapse?.();
    }
  };

  const dismiss = (event: KeyboardEvent<HTMLElement>): void => {
    if (!expanded || event.key !== DISMISS_KEY || onCollapse === undefined) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onCollapse();
  };

  return { lineRef, hasOpened, enter, leave, dismiss };
};
