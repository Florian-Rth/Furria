import type { FlapFaceWidth } from './deck-fit';
import type { GreetingPoint, GreetingRect } from './greeting-geometry';
import { burstOriginOf, cellBoxOf } from './greeting-geometry';

export interface GreetingMeasure {
  boxes: (GreetingRect | null)[];
  widthOf: FlapFaceWidth;
}

const TITLE_SELECTOR = '[data-kk-screen-header-title]';
const CELL_SELECTOR = '[data-kk-flap-cell]';
const ORIGIN: GreetingRect = { left: 0, top: 0, width: 0, height: 0 };

const unmeasurable: FlapFaceWidth = () => Number.POSITIVE_INFINITY;

const offsetWithin = (element: HTMLElement, root: HTMLElement): GreetingRect => {
  let left = 0;
  let top = 0;
  let node: Element | null = element;

  while (node instanceof HTMLElement && node !== root) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent;
  }

  return { left, top, width: element.offsetWidth, height: element.offsetHeight };
};

const lineHeightOf = (title: Element, fallback: number): number => {
  const lineHeight = Number.parseFloat(window.getComputedStyle(title).lineHeight);

  return Number.isNaN(lineHeight) ? fallback : lineHeight;
};

const meterOf = (title: Element): FlapFaceWidth => {
  const style = window.getComputedStyle(title);
  const context = document.createElement('canvas').getContext('2d');
  const tracking = Number.parseFloat(style.letterSpacing);
  const spacing = Number.isNaN(tracking) ? 0 : tracking;

  if (context === null) {
    return unmeasurable;
  }

  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  return (face) => context.measureText(face).width + spacing * Array.from(face).length;
};

const cellsOf = (title: Element): HTMLElement[] =>
  Array.from(title.querySelectorAll(CELL_SELECTOR)).filter(
    (cell): cell is HTMLElement => cell instanceof HTMLElement,
  );

const boxOf = (cell: HTMLElement, root: HTMLElement, title: Element): GreetingRect | null => {
  const glyph = offsetWithin(cell, root);

  return glyph.width === 0 ? null : cellBoxOf(glyph, ORIGIN, lineHeightOf(title, glyph.height));
};

export const measureGreeting = (root: HTMLElement): GreetingMeasure | null => {
  const title = root.querySelector(TITLE_SELECTOR);

  if (title === null) {
    return null;
  }

  return {
    boxes: cellsOf(title).map((cell) => boxOf(cell, root, title)),
    widthOf: meterOf(title),
  };
};

export const burstOriginIn = (root: HTMLElement | null): GreetingPoint | null => {
  const title = root?.querySelector(TITLE_SELECTOR) ?? null;
  const last = title === null ? undefined : cellsOf(title).at(-1);
  const box =
    root === null || title === null || last === undefined ? null : boxOf(last, root, title);

  return box === null ? null : burstOriginOf(box);
};
