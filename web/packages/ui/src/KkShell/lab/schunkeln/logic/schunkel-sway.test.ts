import { describe, expect, it } from 'vitest';
import type { SwayState } from './schunkel-sway';
import {
  applyDueKick,
  kicksOf,
  kickVelocityOf,
  swayResting,
  swayStep,
  waveTargetAt,
} from './schunkel-sway';

const FRAME = 1 / 60;

const settleFrom = (state: SwayState, frames: number): SwayState => {
  let current = state;

  for (let frame = 0; frame < frames; frame += 1) {
    current = swayStep(current, 0, FRAME);
  }

  return current;
};

const signChangesFrom = (state: SwayState, frames: number): number => {
  let current = state;
  let changes = 0;

  for (let frame = 0; frame < frames; frame += 1) {
    const next = swayStep(current, 0, FRAME);

    if (Math.sign(next.angle) !== Math.sign(current.angle) && next.angle !== 0) {
      changes += 1;
    }

    current = next;
  }

  return changes;
};

describe('swayStep', () => {
  it.each([
    [{ angle: 10, velocity: 0 }],
    [{ angle: -12, velocity: 40 }],
    [{ angle: 0, velocity: kickVelocityOf(-13) }],
  ])('resolves %o to upright within three seconds', (state) => {
    expect(swayResting(settleFrom(state, 180))).toBe(true);
  });

  it('swings through upright a few times before resting', () => {
    const changes = signChangesFrom({ angle: 0, velocity: kickVelocityOf(12) }, 120);

    expect(changes).toBeGreaterThanOrEqual(3);
    expect(changes).toBeLessThanOrEqual(8);
  });

  it.each([
    [10, 0],
    [-10, 0],
  ])('pulls towards the target %d', (target, angle) => {
    const next = swayStep({ angle, velocity: 0 }, target, FRAME);

    expect(Math.sign(next.velocity)).toBe(Math.sign(target));
  });

  it.each([
    [0.5, FRAME],
    [0.5, 0.5],
  ])('never steps further than a frame budget (%d at %d s)', (angle, seconds) => {
    const next = swayStep({ angle, velocity: 0 }, 0, seconds);

    expect(next.angle).toBeGreaterThan(0);
  });

  it('clamps the lean', () => {
    expect(swayStep({ angle: 15, velocity: 5000 }, 0, FRAME).angle).toBe(16);
  });
});

describe('waveTargetAt', () => {
  it.each([
    [0, 3],
    [1, 3],
    [-0.2, 0],
    [1.4, 5],
  ])('stands upright outside the travel at progress %d', (progress, index) => {
    expect(waveTargetAt(progress, index, 10)).toBe(0);
  });

  it('keeps neighbours leaning together', () => {
    const first = waveTargetAt(0.3, 0, 10);
    const second = waveTargetAt(0.3, 1, 10);

    expect(Math.sign(first)).toBe(Math.sign(second));
    expect(Math.abs(first - second)).toBeLessThan(4);
  });

  it('never leans past its reach', () => {
    const peaks = Array.from({ length: 101 }, (_, step) =>
      Math.abs(waveTargetAt(step / 100, 2, 10)),
    );

    expect(Math.max(...peaks)).toBeLessThanOrEqual(10);
  });
});

describe('kicksOf', () => {
  it('ripples the kick along the row', () => {
    expect(kicksOf(3, 100, 50, 7)).toEqual([
      { at: 100, velocity: 7 },
      { at: 150, velocity: 7 },
      { at: 200, velocity: 7 },
    ]);
  });
});

describe('applyDueKick', () => {
  it.each([
    [null, 100, { angle: 1, velocity: 2 }, null],
    [{ at: 200, velocity: 5 }, 100, { angle: 1, velocity: 2 }, { at: 200, velocity: 5 }],
    [{ at: 50, velocity: 5 }, 100, { angle: 1, velocity: 7 }, null],
  ])('applies %o at %d', (kick, now, state, remaining) => {
    expect(applyDueKick({ angle: 1, velocity: 2 }, kick, now)).toEqual({ state, kick: remaining });
  });
});
