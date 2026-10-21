import { describe, expect, it } from 'vitest';
import type { KkShakeSample } from './globe-shake';
import { KK_SHAKE_REST, senseShake, shakeForceOf, simulateShake } from './globe-shake';

const shakesIn = (samples: readonly KkShakeSample[]): number[] => {
  let state = KK_SHAKE_REST;
  const hits: number[] = [];
  for (const sample of samples) {
    const reading = senseShake(state, sample);
    state = reading.state;
    if (reading.shaken) {
      hits.push(sample.at);
    }
  }
  return hits;
};

const beat = (peaks: readonly number[]): KkShakeSample[] =>
  peaks.flatMap((at) => [
    { at, force: 20 },
    { at: at + 40, force: 1 },
  ]);

describe('senseShake', () => {
  it.each([
    { name: 'two quick peaks', samples: beat([0, 300]), hits: [300] },
    { name: 'one peak only', samples: beat([0]), hits: [] },
    { name: 'peaks spread too far apart', samples: beat([0, 900, 1800]), hits: [] },
    {
      name: 'a held push without release',
      samples: [0, 100, 200, 300].map((at) => ({ at, force: 20 })),
      hits: [],
    },
    {
      name: 'peaks during the cooldown',
      samples: beat([0, 200, 400, 600]),
      hits: [200],
    },
    {
      name: 'each short shake after the cooldown counts',
      samples: beat([0, 200, 1000, 1200, 2000, 2200]),
      hits: [200, 1200, 2200],
    },
    {
      name: 'gentle movement below the threshold',
      samples: [0, 100, 200, 300].map((at) => ({ at, force: 9 })),
      hits: [],
    },
  ])('$name', ({ samples, hits }) => {
    expect(shakesIn(samples)).toEqual(hits);
  });

  it('recognises a simulated shake', () => {
    expect(shakesIn(simulateShake(5000))).toHaveLength(1);
  });
});

describe('shakeForceOf', () => {
  it.each([
    { linear: { x: 3, y: 4, z: 0 }, withGravity: { x: 0, y: 9.81, z: 0 }, force: 5 },
    { linear: { x: null, y: null, z: null }, withGravity: { x: 0, y: 19.81, z: 0 }, force: 10 },
    { linear: null, withGravity: { x: 0, y: 4.81, z: 0 }, force: 5 },
    { linear: null, withGravity: null, force: 0 },
  ])('measures $force', ({ linear, withGravity, force }) => {
    expect(shakeForceOf(linear, withGravity)).toBeCloseTo(force, 5);
  });
});
