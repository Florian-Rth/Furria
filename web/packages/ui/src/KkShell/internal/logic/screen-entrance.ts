import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';
import type { KkScreenMove } from '../../screen-move';

const { screen } = kkTokens.shell;

export interface KkScreenEntrance {
  from: TargetAndTransition;
  to: TargetAndTransition;
  transition: Transition;
}

const SETTLED: TargetAndTransition = { opacity: 1, x: 0, scale: 1 };

const TRAVEL: Transition = { duration: screen.travelSeconds, ease: [0.22, 0.61, 0.36, 1] };
const FADE: Transition = { duration: screen.fadeSeconds, ease: 'easeOut' };
const NONE: Transition = { duration: 0 };

const ARRIVAL: Record<KkScreenMove, TargetAndTransition> = {
  still: SETTLED,
  'lateral-forward': { opacity: 0, x: screen.lateralTravel, scale: 1 },
  'lateral-back': { opacity: 0, x: -screen.lateralTravel, scale: 1 },
  deeper: { opacity: 0, x: screen.deeperTravel, scale: screen.deeperScale },
  shallower: { opacity: 0, x: -screen.deeperTravel, scale: screen.shallowerScale },
};

const FADED: TargetAndTransition = { opacity: 0, x: 0, scale: 1 };

export const screenEntranceOf = (move: KkScreenMove, reducedMotion: boolean): KkScreenEntrance => {
  if (move === 'still') {
    return { from: SETTLED, to: SETTLED, transition: NONE };
  }

  if (reducedMotion) {
    return { from: FADED, to: SETTLED, transition: FADE };
  }

  return { from: ARRIVAL[move], to: SETTLED, transition: TRAVEL };
};
