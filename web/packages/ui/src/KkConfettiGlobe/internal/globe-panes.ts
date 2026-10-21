import type { GlobePane } from './globe-world';

const FAR_AWAY = -1e6;
const NOWHERE: GlobePane = {
  left: FAR_AWAY,
  top: FAR_AWAY,
  right: FAR_AWAY,
  bottom: FAR_AWAY,
  radius: 0,
};

export const findPaneElements = (selector: string): Element[] =>
  selector === '' ? [] : Array.from(document.querySelectorAll(selector));

export const radiusOf = (element: Element): number =>
  Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;

export const paneOf = (element: Element, radius: number): GlobePane => {
  const box = element.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) {
    return NOWHERE;
  }
  return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, radius };
};

export interface KkGlobeChrome {
  readonly ceiling: string;
  readonly floor: string;
}

export interface GlobeFrame {
  readonly top: number;
  readonly floor: number;
}

export const findChrome = (selector: string): Element | null =>
  selector === '' ? null : document.querySelector(selector);

export const frameOf = (
  ceiling: Element | null,
  footing: Element | null,
  fallbackFloor: number,
): GlobeFrame => ({
  top: ceiling === null ? 0 : Math.max(0, ceiling.getBoundingClientRect().bottom),
  floor: footing === null ? fallbackFloor : footing.getBoundingClientRect().top,
});
