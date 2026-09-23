import type { DockBox, DockGeometry, DockHeadline } from './dock-flight';

const HEADLINE_SELECTOR = '[data-kk-dock-header] [data-kk-screen-header-title]';
const BAR_TITLE_SELECTOR = '[data-kk-dock-title]';
const GLYPH_PROPERTY = 'font-size';

interface DockPoint {
  left: number;
  top: number;
}

const glyphOf = (element: Element): number =>
  Number.parseFloat(window.getComputedStyle(element).getPropertyValue(GLYPH_PROPERTY));

const documentOffsetOf = (element: HTMLElement): DockPoint => {
  let left = 0;
  let top = 0;
  let node: Element | null = element;

  while (node instanceof HTMLElement) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent;
  }

  return { left, top };
};

const headlineBoxOf = (element: HTMLElement): DockBox => ({
  ...documentOffsetOf(element),
  width: element.offsetWidth,
  height: element.offsetHeight,
  glyph: glyphOf(element),
});

const headlineOf = (element: HTMLElement): DockHeadline => ({
  box: headlineBoxOf(element),
  text: element.textContent ?? '',
});

const slotBoxOf = (element: Element): DockBox => {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    glyph: glyphOf(element),
  };
};

const textWidthOf = (element: Element): number => {
  const range = document.createRange();
  range.selectNodeContents(element);

  return range.getBoundingClientRect().width;
};

export const measureDock = (slot: HTMLElement | null): DockGeometry | null => {
  const headline = document.querySelector(HEADLINE_SELECTOR);
  const barTitle = slot?.querySelector(BAR_TITLE_SELECTOR) ?? null;

  if (barTitle === null) {
    return null;
  }

  return {
    headline: headline instanceof HTMLElement ? headlineOf(headline) : null,
    slot: slotBoxOf(barTitle),
    titleWidth: textWidthOf(barTitle),
  };
};
