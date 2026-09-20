import { describe, expect, it } from 'vitest';
import type { KkMottoStageState } from '../motto-stage-state';
import type { KkMottoStageMotion } from './motto-stage-motion';
import { mottoStageMotionOf } from './motto-stage-motion';

const STATES: KkMottoStageState[] = ['teaser', 'running', 'resting'];

describe('mottoStageMotionOf', () => {
  it.each<[KkMottoStageState, boolean, KkMottoStageMotion]>([
    ['teaser', false, { ambient: true, reveal: true }],
    ['running', false, { ambient: true, reveal: true }],
    ['resting', false, { ambient: false, reveal: true }],
    ['teaser', true, { ambient: false, reveal: false }],
    ['running', true, { ambient: false, reveal: false }],
    ['resting', true, { ambient: false, reveal: false }],
  ])('decides %s with reduced motion %s', (state, reducedMotion, expected) => {
    expect(mottoStageMotionOf(state, reducedMotion)).toEqual(expected);
  });

  it.each(STATES)('holds every motion still under reduced motion, for %s', (state) => {
    const motion = mottoStageMotionOf(state, true);

    expect(Object.values(motion).some(Boolean)).toBe(false);
  });

  it('lets the glow drift only while the Session is announced or running', () => {
    expect(mottoStageMotionOf('resting', false).ambient).toBe(false);
    expect(mottoStageMotionOf('teaser', false).ambient).toBe(true);
    expect(mottoStageMotionOf('running', false).ambient).toBe(true);
  });
});
