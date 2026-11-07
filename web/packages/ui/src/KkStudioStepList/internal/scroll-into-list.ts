const SCROLLING = new Set(['auto', 'scroll']);

const scrollerOf = (node: HTMLElement): HTMLElement | null => {
  let parent = node.parentElement;
  while (parent !== null && !SCROLLING.has(getComputedStyle(parent).overflowY)) {
    parent = parent.parentElement;
  }

  return parent;
};

export const scrollIntoList = (node: HTMLElement): void => {
  const scroller = scrollerOf(node);
  if (scroller === null) {
    return;
  }
  const box = node.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  if (box.top < view.top) {
    scroller.scrollBy({ top: box.top - view.top, behavior: 'smooth' });
  } else if (box.bottom > view.bottom) {
    scroller.scrollBy({
      top: Math.min(box.top - view.top, box.bottom - view.bottom),
      behavior: 'smooth',
    });
  }
};
