export const HEADLINE_SELECTOR = '[data-kk-screen-header-title]';
export const FANFARE_HEADER_SELECTOR = '[data-fanfare-header]';
export const CHROME_SELECTOR = '[data-kk-chrome]';

export interface FanfarePoint {
  left: number;
  top: number;
}

export const documentOffsetOf = (element: HTMLElement): FanfarePoint => {
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

export const glyphOf = (element: Element): number =>
  Number.parseFloat(window.getComputedStyle(element).getPropertyValue('font-size'));

export const onRemeasure = (remeasure: () => void): (() => void) => {
  let alive = true;

  const onResize = (): void => {
    remeasure();
  };

  remeasure();
  window.addEventListener('resize', onResize);
  void document.fonts.ready.then(() => {
    if (alive) {
      remeasure();
    }
  });

  return () => {
    alive = false;
    window.removeEventListener('resize', onResize);
  };
};
