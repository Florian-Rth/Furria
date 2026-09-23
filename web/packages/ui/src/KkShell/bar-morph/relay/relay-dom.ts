import type { RelayAnchor, RelayTextMetrics } from './relay-flight';
import type { RelayMarkKind } from './relay-plan';

export interface RelayPiece extends RelayTextMetrics {
  clone: HTMLElement;
  rect: DOMRect;
  color: string;
}

export interface RelayDeparture {
  headline: RelayPiece | null;
  headlineOpacity: number;
  text: RelayPiece | null;
  mark: RelayPiece | null;
  markKind: RelayMarkKind;
  barBottom: number;
  viewportHeight: number;
}

export interface RelayArrival {
  wrapper: HTMLElement;
  text: HTMLElement | null;
  mark: HTMLElement | null;
  markKind: RelayMarkKind;
  headline: HTMLElement | null;
}

const BAR_SELECTOR = '[data-kk-shell-chrome] header';
const HEADLINE_SELECTOR = '[data-kk-shell-entrance] [data-kk-screen-header-title]';
const TEXT_SELECTOR = '[data-kk-shell-bar-title], [data-kk-shell-bar-wordmark]';
const MARK_SELECTOR = '[data-kk-shell-bar-mark]';
const BACK_SELECTOR = '[data-kk-shell-bar-back]';
const CLOSE_SELECTOR = '[data-kk-shell-bar-close]';
const NORMAL_LINE_HEIGHT = 1.2;

export const effectiveOpacityOf = (element: Element): number => {
  let opacity = 1;
  let node: Element | null = element;

  while (node !== null) {
    opacity *= Number.parseFloat(window.getComputedStyle(node).opacity);
    node = node.parentElement;
  }

  return opacity;
};

export const visibleTextOf = (root: ParentNode): HTMLElement | null => {
  let visible: HTMLElement | null = null;
  let strongest = 0;

  for (const candidate of root.querySelectorAll<HTMLElement>(TEXT_SELECTOR)) {
    const opacity = effectiveOpacityOf(candidate);

    if (opacity > strongest) {
      strongest = opacity;
      visible = candidate;
    }
  }

  return visible;
};

export const markKindOf = (mark: Element | null): RelayMarkKind => {
  if (mark === null) {
    return 'none';
  }

  if (mark.closest(BACK_SELECTOR) !== null) {
    return 'back';
  }

  return mark.closest(CLOSE_SELECTOR) === null ? 'broom' : 'close';
};

const cloneOf = (element: HTMLElement): HTMLElement => {
  const clone = element.cloneNode(true);

  return clone instanceof HTMLElement ? clone : document.createElement('span');
};

export const pieceOf = (element: HTMLElement): RelayPiece => {
  const style = window.getComputedStyle(element);
  const glyph = Number.parseFloat(style.fontSize);
  const lineHeight = Number.parseFloat(style.lineHeight);

  return {
    clone: cloneOf(element),
    rect: element.getBoundingClientRect(),
    color: style.color,
    glyph,
    lineHeight: Number.isNaN(lineHeight) ? glyph * NORMAL_LINE_HEIGHT : lineHeight,
  };
};

const pieceOrNull = (element: HTMLElement | null): RelayPiece | null =>
  element === null ? null : pieceOf(element);

export const anchorOf = (rect: DOMRect, metrics: RelayTextMetrics): RelayAnchor => ({
  x: rect.left,
  y: rect.top + metrics.lineHeight / 2,
  glyph: metrics.glyph,
});

export const captureDeparture = (): RelayDeparture | null => {
  const bar = document.querySelector<HTMLElement>(BAR_SELECTOR);

  if (bar === null) {
    return null;
  }

  const headline = document.querySelector<HTMLElement>(HEADLINE_SELECTOR);
  const mark = bar.querySelector<HTMLElement>(MARK_SELECTOR);

  return {
    headline: pieceOrNull(headline),
    headlineOpacity: headline === null ? 0 : effectiveOpacityOf(headline),
    text: pieceOrNull(visibleTextOf(bar)),
    mark: pieceOrNull(mark),
    markKind: markKindOf(mark),
    barBottom: bar.getBoundingClientRect().bottom,
    viewportHeight: window.innerHeight,
  };
};

export const arrivalOf = (wrapper: HTMLElement): RelayArrival => {
  const mark = wrapper.querySelector<HTMLElement>(MARK_SELECTOR);

  return {
    wrapper,
    text: visibleTextOf(wrapper),
    mark,
    markKind: markKindOf(mark),
    headline: document.querySelector<HTMLElement>(HEADLINE_SELECTOR),
  };
};
