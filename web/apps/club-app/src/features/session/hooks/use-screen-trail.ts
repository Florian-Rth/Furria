import type { KkScreenMove } from '@furria/ui';
import { useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
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
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [trail, setTrail] = useState<ScreenTrail>({ paths: [], move: 'still' });

  if (trail.paths.at(LAST) !== path) {
    setTrail(advanceTrail(trail, path, SECTION_ROOTS));
  }

  return { path, move: trail.move };
};
