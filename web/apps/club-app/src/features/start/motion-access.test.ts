import { describe, expect, it } from 'vitest';
import type { MotionAccess, MotionSupport } from './motion-access';
import { accessAfterAnswer, asksForMotion, motionAccessOf } from './motion-access';

describe('motionAccessOf', () => {
  it.each<[MotionSupport, MotionAccess]>([
    [{ available: false, gated: true }, 'unavailable'],
    [{ available: true, gated: false }, 'granted'],
    [{ available: true, gated: true }, 'needsGesture'],
  ])('%o → %s', (support, access) => {
    expect(motionAccessOf(support)).toBe(access);
  });
});

describe('asksForMotion', () => {
  it.each<[MotionAccess, boolean]>([
    ['needsGesture', true],
    ['denied', true],
    ['granted', false],
    ['unavailable', false],
  ])('%s → %s', (access, asks) => {
    expect(asksForMotion(access)).toBe(asks);
  });
});

describe('accessAfterAnswer', () => {
  it.each<[string, MotionAccess]>([
    ['granted', 'granted'],
    ['denied', 'denied'],
    ['prompt', 'denied'],
  ])('%s → %s', (answer, access) => {
    expect(accessAfterAnswer(answer)).toBe(access);
  });
});
