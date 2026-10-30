import { useRouterState } from '@tanstack/react-router';
import type { BackStackSpot } from './back-stack';
import { spotBefore } from './back-stack';

export const useSpotBehind = (): BackStackSpot | undefined =>
  spotBefore(useRouterState({ select: (state) => state.location.state.__TSR_index }));
