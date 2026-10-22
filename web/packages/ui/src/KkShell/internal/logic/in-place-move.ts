import type { KkScreenMove } from '../../screen-move';

export const arrivesInPlace = (move: KkScreenMove): boolean =>
  move === 'still' || move === 'restored';
