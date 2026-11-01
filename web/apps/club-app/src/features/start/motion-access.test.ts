import { describe, expect, it } from 'vitest';
import type { MotionAccess, MotionAsk, MotionSupport } from './motion-access';
import { accessAfterAnswer, asksForMotion, motionAccessOf } from './motion-access';

describe('motionAccessOf', () => {
  it.each<[MotionSupport, MotionAccess]>([
    [{ available: false, gated: true, refused: false }, 'unavailable'],
    [{ available: true, gated: false, refused: true }, 'granted'],
    [{ available: true, gated: true, refused: false }, 'needsGesture'],
    [{ available: true, gated: true, refused: true }, 'denied'],
  ])('%o → %s', (support, access) => {
    expect(motionAccessOf(support)).toBe(access);
  });
});

describe('asksForMotion', () => {
  it.each<[MotionAccess, MotionAsk, boolean]>([
    ['needsGesture', 'quiet', true],
    ['needsGesture', 'gesture', true],
    ['denied', 'gesture', false],
    ['denied', 'quiet', false],
    ['denied', 'deliberate', true],
    ['granted', 'deliberate', false],
    ['unavailable', 'deliberate', false],
  ])('%s asked %s → %s', (access, ask, asks) => {
    expect(asksForMotion(access, ask)).toBe(asks);
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
