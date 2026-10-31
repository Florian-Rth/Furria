import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { useBeatReached } from './use-beat-reached';

export const useBeatShown = (atMs: number): boolean => {
  const reached = useBeatReached(atMs);
  const still = useReducedMotion();

  return reached || still;
};
