import type { KkScreenMove } from '@furria/ui/screen-move';
import { useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { landedBySystem } from '@/lib/back-stack';
import { APP_DESTINATIONS } from '../app-sections';
import type { ScreenTrail } from '../screen-trail';
import { advanceTrail } from '../screen-trail';

const SECTION_ROOTS = APP_DESTINATIONS.map((destination) => destination.to);
const LAST = -1;

export interface ScreenJourney {
  path: string;
  move: KkScreenMove;
}

export const useScreenTrail = (): ScreenJourney => {
  const path = useRouterState({
    select: (state) => state.matches.at(LAST)?.pathname ?? state.location.pathname,
  });
  const locationState = useRouterState({ select: (state) => state.location.state });
  const [trail, setTrail] = useState<ScreenTrail>({ paths: [], move: 'still' });

  if (trail.paths.at(LAST) !== path) {
    setTrail(advanceTrail(trail, path, SECTION_ROOTS, landedBySystem(locationState)));
  }

  return { path, move: trail.move };
};
