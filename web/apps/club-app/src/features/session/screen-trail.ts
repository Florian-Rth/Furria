import type { KkScreenMove } from '@furria/ui';

export interface ScreenTrail {
  paths: readonly string[];
  move: KkScreenMove;
}

const NOT_FOUND = -1;
const FIRST = 0;
const LAST = -1;

const rootIndexOf = (path: string | undefined, roots: readonly string[]): number =>
  path === undefined ? NOT_FOUND : roots.indexOf(path);

export const advanceTrail = (
  trail: ScreenTrail,
  next: string,
  roots: readonly string[],
): ScreenTrail => {
  const current = trail.paths.at(LAST);

  if (current === undefined || current === next) {
    return { paths: [next], move: 'still' };
  }

  const entered = rootIndexOf(next, roots);
  const startedIn = rootIndexOf(trail.paths.at(FIRST), roots);

  if (entered !== NOT_FOUND) {
    if (startedIn === NOT_FOUND || startedIn === entered) {
      return { paths: [next], move: 'shallower' };
    }

    return { paths: [next], move: entered > startedIn ? 'lateral-forward' : 'lateral-back' };
  }

  const walkedBackTo = trail.paths.indexOf(next);

  if (walkedBackTo !== NOT_FOUND) {
    return { paths: trail.paths.slice(0, walkedBackTo + 1), move: 'shallower' };
  }

  return { paths: [...trail.paths, next], move: 'deeper' };
};
