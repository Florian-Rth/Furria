const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const scrollNewRowIntoView = (node: HTMLElement | null): void => {
  if (node === null) {
    return;
  }

  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
};
