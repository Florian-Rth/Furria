import { enteringDotsOf, entranceDelayOf } from '@furria/studio/score-entrance';
import { describe, expect, it } from 'vitest';

const dot = (spotId: number, x: number, y: number) => ({
  spotId,
  number: spotId,
  firstName: null,
  x,
  y,
  own: false,
  open: false,
});

describe('enteringDotsOf', () => {
  it('starts each place where it stood in the step before', () => {
    const entering = enteringDotsOf([dot(1, 0.2, 0.3), dot(2, 0.8, 0.3)], [dot(2, 0.6, 0.9)]);

    expect(entering.map((entry) => [entry.fromX, entry.fromY])).toEqual([
      [0.5, 1],
      [0.6, 0.9],
    ]);
  });

  it('starts the first step from the front centre', () => {
    expect(enteringDotsOf([dot(1, 0.2, 0.3)], null).map((entry) => entry.fromY)).toEqual([1]);
  });
});

describe('entranceDelayOf', () => {
  it('staggers later rows', () => {
    expect(entranceDelayOf(3)).toBeGreaterThan(entranceDelayOf(0));
  });
});
