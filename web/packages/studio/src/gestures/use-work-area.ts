import { useEffect } from 'react';

const WORK_AREA_STYLE: Readonly<Record<string, string>> = {
  'touch-action': 'none',
  'user-select': 'none',
  '-webkit-user-select': 'none',
  '-webkit-touch-callout': 'none',
  '-webkit-tap-highlight-color': 'transparent',
  'overscroll-behavior': 'contain',
};

const BLOCKED_BROWSER_GESTURES = ['contextmenu', 'selectstart', 'dragstart'] as const;

const block = (event: Event): void => {
  event.preventDefault();
};

export const useWorkArea = (node: HTMLElement | SVGElement | null): void => {
  useEffect(() => {
    if (node === null) {
      return;
    }
    const previous = Object.keys(WORK_AREA_STYLE).map(
      (property) => [property, node.style.getPropertyValue(property)] as const,
    );
    for (const [property, value] of Object.entries(WORK_AREA_STYLE)) {
      node.style.setProperty(property, value);
    }
    for (const type of BLOCKED_BROWSER_GESTURES) {
      node.addEventListener(type, block);
    }

    return () => {
      for (const type of BLOCKED_BROWSER_GESTURES) {
        node.removeEventListener(type, block);
      }
      for (const [property, value] of previous) {
        node.style.setProperty(property, value);
      }
    };
  }, [node]);
};
