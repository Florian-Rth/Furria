import { useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
};

export const useReducedMotionPreference = (): boolean => {
  const [reducedMotion] = useState(prefersReducedMotion);

  return reducedMotion;
};
