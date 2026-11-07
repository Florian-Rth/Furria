const WHOLE = 0.999;
const THRESHOLDS = [0, WHOLE, 1];

export const watchWholeLabel = (node: HTMLElement | null): (() => void) | undefined => {
  if (node === null) {
    return undefined;
  }
  const root = node.closest('[data-kk-timeline-view]');
  const observer = new IntersectionObserver(
    (entries) => {
      const last = entries.at(-1);
      if (last !== undefined) {
        node.dataset.cut = String(last.intersectionRatio < WHOLE);
      }
    },
    { root, threshold: THRESHOLDS },
  );
  observer.observe(node);

  return () => {
    observer.disconnect();
  };
};

export const CUT_LABEL = {
  transition: 'opacity 120ms linear',
  '&[data-cut="true"]': { opacity: 0 },
} as const;
