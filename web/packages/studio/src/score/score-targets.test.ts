import { scoreTapOf, scoreTargetsOf } from '@furria/studio/score-targets';
import { describe, expect, it } from 'vitest';

const parts = [
  { key: 1, range: { start: 0, end: 8 } },
  { key: 2, range: null },
];
const steps = [
  { key: 7, range: { start: 2, end: 4 } },
  { key: 8, range: { start: 4, end: 6 } },
];

describe('scoreTargetsOf', () => {
  it.each([
    [false, [{ key: 'part:1', seconds: 0, until: 8, lane: 'parts' }]],
    [
      true,
      [
        { key: 'step:7', seconds: 2, until: 4, lane: 'steps' },
        { key: 'step:8', seconds: 4, until: 6, lane: 'steps' },
      ],
    ],
  ])('taps parts on the phone and steps when wide (wide %s)', (wide, expected) => {
    expect(
      scoreTargetsOf(parts, steps, wide).map(({ key, seconds, until, lane }) => ({
        key,
        seconds,
        until,
        lane,
      })),
    ).toEqual(expected);
  });
});

describe('scoreTapOf', () => {
  it.each([
    ['step:8', { kind: 'step', id: 8 }],
    ['step:9', null],
  ])('resolves %s to what was tapped', (key, expected) => {
    expect(scoreTapOf(scoreTargetsOf(parts, steps, true), key)).toEqual(expected);
  });
});
