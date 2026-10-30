import type { LoopKind } from '@/features/act-practice/practice-controls';

export type WayLoopKey =
  | { glyph: 'loopStep'; pressed: false; press: 'loopStep' }
  | { glyph: 'loopStep'; pressed: true; press: 'loopStep' }
  | { glyph: 'loopPart'; pressed: true; press: 'loopPart' };

export const wayLoopKeyOf = (kind: LoopKind): WayLoopKey => {
  if (kind === 'part') {
    return { glyph: 'loopPart', pressed: true, press: 'loopPart' };
  }

  return kind === 'step'
    ? { glyph: 'loopStep', pressed: true, press: 'loopStep' }
    : { glyph: 'loopStep', pressed: false, press: 'loopStep' };
};
