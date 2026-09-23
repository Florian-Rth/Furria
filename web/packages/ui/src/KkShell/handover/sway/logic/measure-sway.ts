import type { SwayGlyph, SwayPlan, SwayPoint } from './sway-pose';
import { swayPlanOf } from './sway-pose';

const HEADLINE_SELECTOR = '[data-kk-sway-header] [data-kk-screen-header-title]';
const BAR_TITLE_SELECTOR = '[data-kk-shell-bar-title]';
const GLYPH_PROPERTY = 'font-size';

const textNodesOf = (element: Element): Text[] => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (node instanceof Text) {
      nodes.push(node);
    }
  }

  return nodes;
};

const glyphsOf = (element: Element | null): SwayGlyph[] => {
  if (element === null) {
    return [];
  }

  const origin = element.getBoundingClientRect();
  const range = document.createRange();
  const glyphs: SwayGlyph[] = [];
  let lineTop: number | null = null;
  let line = 0;

  for (const text of textNodesOf(element)) {
    for (let offset = 0; offset < text.data.length; offset += 1) {
      range.setStart(text, offset);
      range.setEnd(text, offset + 1);
      const box = range.getBoundingClientRect();
      lineTop ??= box.top;

      if (box.height > 0 && box.top > lineTop + box.height / 2) {
        lineTop = box.top;
        line += 1;
      }

      glyphs.push({
        char: text.data.charAt(offset),
        left: box.left - origin.left,
        top: box.top - origin.top,
        width: box.width,
        height: box.height,
        line,
      });
    }
  }

  return glyphs;
};

const glyphSizeOf = (element: Element): number =>
  Number.parseFloat(window.getComputedStyle(element).getPropertyValue(GLYPH_PROPERTY));

const documentOffsetOf = (element: HTMLElement): SwayPoint => {
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

const viewportOffsetOf = (element: Element): SwayPoint => {
  const rect = element.getBoundingClientRect();

  return { left: rect.left, top: rect.top };
};

const barTitleOf = (cell: HTMLElement | null): Element | null =>
  cell?.querySelector(BAR_TITLE_SELECTOR) ?? null;

export const measureLineGlyphs = (cell: HTMLElement | null): SwayGlyph[] => {
  const title = barTitleOf(cell);

  if (cell === null || title === null) {
    return [];
  }

  const shift = title.getBoundingClientRect();
  const origin = cell.getBoundingClientRect();

  return glyphsOf(title)
    .filter((glyph) => glyph.line === 0)
    .map((glyph) => ({
      ...glyph,
      left: glyph.left + shift.left - origin.left,
      top: glyph.top + shift.top - origin.top,
    }));
};

export const measureSwayPlan = (slot: HTMLElement | null): SwayPlan | null => {
  const headline = document.querySelector(HEADLINE_SELECTOR);
  const title = barTitleOf(slot);

  if (!(headline instanceof HTMLElement) || title === null) {
    return null;
  }

  const plan = swayPlanOf(
    glyphsOf(headline),
    documentOffsetOf(headline),
    glyphsOf(title),
    viewportOffsetOf(title),
    glyphSizeOf(title) / glyphSizeOf(headline),
  );

  return plan.letters.length > 0 ? plan : null;
};
