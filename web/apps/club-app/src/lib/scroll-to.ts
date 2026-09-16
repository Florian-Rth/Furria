const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const scrollElementIntoView = (
  node: Element | null | undefined,
  block: ScrollLogicalPosition,
): void => {
  if (node === null || node === undefined) {
    return;
  }

  node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block });
};
