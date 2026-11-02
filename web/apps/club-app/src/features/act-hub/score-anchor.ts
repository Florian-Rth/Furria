const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const partAnchorOf = (partId: number): string => `score-part-${partId}`;

export const scrollToAnchor = (anchor: string): void => {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  document
    .getElementById(anchor)
    ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
};
