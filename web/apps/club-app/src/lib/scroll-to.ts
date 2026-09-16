import type { KkLetterPace } from '@furria/ui';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

const toScrollBehaviour = (pace: KkLetterPace): ScrollBehavior =>
  pace === 'scrubbing' || prefersReducedMotion() ? 'auto' : 'smooth';

export const scrollElementIntoView = (
  node: Element | null | undefined,
  block: ScrollLogicalPosition,
  pace: KkLetterPace = 'settled',
): void => {
  if (node === null || node === undefined) {
    return;
  }

  node.scrollIntoView({ behavior: toScrollBehaviour(pace), block });
};
