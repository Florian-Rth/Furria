import { describe, expect, it } from 'vitest';
import { isLapClosingAt, lapOf, nextLapCloseOf } from './honour-laps';

describe('lapOf', () => {
  it.each([
    [0, { kind: 'none' }],
    [-3, { kind: 'none' }],
    [1, { kind: 'open', index: 0, pieces: 5, struck: 1, metal: 'bronze', under: null }],
    [5, { kind: 'closed', index: 0, pieces: 5, struck: 5, metal: 'bronze', under: null }],
    [6, { kind: 'open', index: 1, pieces: 6, struck: 1, metal: 'silver', under: 'bronze' }],
    [11, { kind: 'closed', index: 1, pieces: 6, struck: 6, metal: 'silver', under: 'bronze' }],
    [14, { kind: 'open', index: 2, pieces: 11, struck: 3, metal: 'gold', under: 'silver' }],
    [27, { kind: 'open', index: 3, pieces: 11, struck: 5, metal: 'garnet', under: 'gold' }],
    [44, { kind: 'closed', index: 4, pieces: 11, struck: 11, metal: 'onyx', under: 'garnet' }],
    [55, { kind: 'closed', index: 5, pieces: 11, struck: 11, metal: 'brilliant', under: 'onyx' }],
    [80, { kind: 'closed', index: 5, pieces: 11, struck: 11, metal: 'brilliant', under: 'onyx' }],
  ])('places %i sessions on their lap', (sessions, lap) => {
    expect(lapOf(sessions)).toEqual(lap);
  });

  it('keeps a just closed lap open while its last piece strikes', () => {
    expect(lapOf(22, true)).toEqual({
      kind: 'open',
      index: 2,
      pieces: 11,
      struck: 11,
      metal: 'gold',
      under: 'silver',
    });
  });
});

describe('isLapClosingAt', () => {
  it.each([
    [5, true],
    [11, true],
    [22, true],
    [33, true],
    [44, true],
    [55, true],
    [0, false],
    [12, false],
    [56, false],
  ])('closes a lap at %i: %s', (sessions, closing) => {
    expect(isLapClosingAt(sessions)).toBe(closing);
  });
});

describe('nextLapCloseOf', () => {
  it.each([
    [0, 5],
    [5, 11],
    [27, 33],
    [54, 55],
    [55, null],
  ])('after %i sessions the next lap closes at %s', (sessions, close) => {
    expect(nextLapCloseOf(sessions)).toBe(close);
  });
});
