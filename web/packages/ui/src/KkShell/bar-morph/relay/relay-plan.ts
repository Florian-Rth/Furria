import type { KkScreenMove } from '../../screen-move';

export type RelayPlan = 'settled' | 'crossfade' | 'climb' | 'descend' | 'pass';

export type RelayClimbSource = 'headline' | 'bar';

export type RelayMarkKind = 'broom' | 'back' | 'close' | 'none';

export type RelayMarkMove = 'stay' | 'swap';

interface RelayPlanInput {
  debut: boolean;
  reducedMotion: boolean;
  move: KkScreenMove;
}

interface RelayHeadlineSighting {
  top: number;
  bottom: number;
  opacity: number;
  barBottom: number;
  viewportHeight: number;
}

const VISIBLE_OPACITY = 0.5;
const FORWARD = -1;
const BACKWARD = 1;

export const relayPlanOf = ({ debut, reducedMotion, move }: RelayPlanInput): RelayPlan => {
  if (!debut || move === 'still') {
    return 'settled';
  }

  if (reducedMotion) {
    return 'crossfade';
  }

  if (move === 'deeper') {
    return 'climb';
  }

  if (move === 'shallower') {
    return 'descend';
  }

  return 'pass';
};

export const climbSourceOf = (sighting: RelayHeadlineSighting | null): RelayClimbSource => {
  if (sighting === null) {
    return 'bar';
  }

  const inView = sighting.bottom > sighting.barBottom && sighting.top < sighting.viewportHeight;

  return inView && sighting.opacity > VISIBLE_OPACITY ? 'headline' : 'bar';
};

export const markMoveOf = (from: RelayMarkKind, to: RelayMarkKind): RelayMarkMove =>
  from === to ? 'stay' : 'swap';

export const passDirectionOf = (move: KkScreenMove): number =>
  move === 'lateral-back' ? BACKWARD : FORWARD;

export type RelayMarkExit = 'tumble' | 'slide' | 'none';

export type RelayMarkEntry = 'drop' | 'shoulder' | 'wiggle' | 'catch' | 'none';

export interface RelayMarkRoles {
  exit: RelayMarkExit;
  entry: RelayMarkEntry;
}

const exitOf = (from: RelayMarkKind): RelayMarkExit => {
  if (from === 'none') {
    return 'none';
  }

  return from === 'broom' ? 'tumble' : 'slide';
};

const entryOf = (to: RelayMarkKind): RelayMarkEntry => {
  if (to === 'none') {
    return 'none';
  }

  return to === 'broom' ? 'drop' : 'shoulder';
};

export const markRolesOf = (from: RelayMarkKind, to: RelayMarkKind): RelayMarkRoles => {
  if (markMoveOf(from, to) === 'stay') {
    return { exit: 'none', entry: to === 'broom' ? 'wiggle' : 'catch' };
  }

  return { exit: exitOf(from), entry: entryOf(to) };
};
