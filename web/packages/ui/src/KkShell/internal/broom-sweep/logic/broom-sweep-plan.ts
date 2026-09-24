import type { KkChromeMotion } from '../../../../internal/chrome-density';
import { handoverAt } from '../../../internal/logic/handover';
import type { KkScreenMove } from '../../../screen-move';
import type { KkBarSnapshot } from '../../logic/bar-scene';

export type BroomSweepGlyph = 'broom' | 'back' | 'close';

export type BroomSweepDirection = 'forward' | 'backward';

export type BroomSweepShift = 'fold' | 'unfold' | 'flick' | 'spin';

export interface BroomSweepGhost {
  text: string;
  wordmark: boolean;
}

export interface BroomSweepPlan {
  direction: BroomSweepDirection;
  shift: BroomSweepShift;
  from: BroomSweepGlyph;
  ghost: BroomSweepGhost;
}

const WORDMARK = 'FURRIA';
const TITLE_SHOWN = 0.5;

export const glyphOf = (snapshot: KkBarSnapshot): BroomSweepGlyph => {
  if (snapshot.origin === null) {
    return 'broom';
  }

  return snapshot.kind === 'fullscreen' ? 'close' : 'back';
};

export const directionOf = (move: KkScreenMove): BroomSweepDirection =>
  move === 'shallower' || move === 'lateral-back' ? 'backward' : 'forward';

export const shiftOf = (from: BroomSweepGlyph, to: BroomSweepGlyph): BroomSweepShift => {
  if (from === to) {
    return 'flick';
  }

  if (from === 'close' || to === 'close') {
    return 'spin';
  }

  return to === 'back' ? 'fold' : 'unfold';
};

export const ghostOf = (
  previous: KkBarSnapshot,
  scrollOffset: number,
  motion: KkChromeMotion,
): BroomSweepGhost => {
  const titled =
    previous.lead === 'title' ||
    glyphOf(previous) === 'close' ||
    handoverAt(scrollOffset, motion).titleOpacity >= TITLE_SHOWN;

  if (titled) {
    return { text: previous.title, wordmark: false };
  }

  if (previous.origin === null) {
    return { text: WORDMARK, wordmark: true };
  }

  return { text: previous.origin.label, wordmark: false };
};

interface BroomSweepPlanInput {
  previous: KkBarSnapshot;
  current: KkBarSnapshot;
  move: KkScreenMove;
  scrollOffset: number;
  motion: KkChromeMotion;
}

export const planBroomSweep = ({
  previous,
  current,
  move,
  scrollOffset,
  motion,
}: BroomSweepPlanInput): BroomSweepPlan => {
  const from = glyphOf(previous);

  return {
    direction: directionOf(move),
    shift: shiftOf(from, glyphOf(current)),
    from,
    ghost: ghostOf(previous, scrollOffset, motion),
  };
};
