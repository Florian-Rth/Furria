import { describe, expect, it } from 'vitest';
import type { SceneFrame } from './gallery-scenes';
import { frameNumberOf, sceneSamplesOf, scenesOf } from './gallery-scenes';

const spanOf = (frames: readonly SceneFrame[]): number[][] =>
  scenesOf(frames).map((scene) => scene.frames.map((frame) => frame.id));

const untimed = (count: number): SceneFrame[] =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1, capturedAt: null }));

describe('scenesOf', () => {
  it.each<[string, SceneFrame[], number[][]]>([
    ['no frames', [], []],
    [
      'frames 89 s apart stay together',
      [
        { id: 1, capturedAt: '2026-02-14T20:00:00Z' },
        { id: 2, capturedAt: '2026-02-14T20:01:29Z' },
      ],
      [[1, 2]],
    ],
    [
      'a 90 s gap opens a new scene',
      [
        { id: 1, capturedAt: '2026-02-14T20:00:00Z' },
        { id: 2, capturedAt: '2026-02-14T20:01:30Z' },
        { id: 3, capturedAt: '2026-02-14T20:01:40Z' },
      ],
      [[1], [2, 3]],
    ],
    [
      'a backwards clock jump never splits',
      [
        { id: 1, capturedAt: '2026-02-14T20:10:00Z' },
        { id: 2, capturedAt: '2026-02-14T20:00:00Z' },
      ],
      [[1, 2]],
    ],
  ])('%s', (_, frames, expected) => {
    expect(spanOf(frames)).toEqual(expected);
  });

  it('cuts frames without capture time into blocks of 100', () => {
    expect(spanOf(untimed(250)).map((scene) => scene.length)).toEqual([100, 100, 50]);
  });

  it('numbers scenes and frames by position with their time span', () => {
    const scenes = scenesOf([
      { id: 7, capturedAt: '2026-02-14T20:00:00Z' },
      { id: 8, capturedAt: '2026-02-14T20:05:00Z' },
      { id: 9, capturedAt: '2026-02-14T20:05:30Z' },
    ]);

    expect(
      scenes.map(({ index, firstNumber, lastNumber, startsAt, endsAt }) => ({
        index,
        firstNumber,
        lastNumber,
        startsAt,
        endsAt,
      })),
    ).toEqual([
      {
        index: 1,
        firstNumber: 1,
        lastNumber: 1,
        startsAt: '2026-02-14T20:00:00Z',
        endsAt: '2026-02-14T20:00:00Z',
      },
      {
        index: 2,
        firstNumber: 2,
        lastNumber: 3,
        startsAt: '2026-02-14T20:05:00Z',
        endsAt: '2026-02-14T20:05:30Z',
      },
    ]);
  });
});

describe('sceneSamplesOf', () => {
  const scenes = scenesOf([
    { id: 1, capturedAt: '2026-02-14T20:00:00Z' },
    { id: 2, capturedAt: '2026-02-14T20:00:10Z' },
    { id: 3, capturedAt: '2026-02-14T20:00:20Z' },
    { id: 4, capturedAt: '2026-02-14T20:10:00Z' },
    { id: 5, capturedAt: '2026-02-14T20:20:00Z' },
    { id: 6, capturedAt: '2026-02-14T20:30:00Z' },
  ]);

  it.each<[string, number, number[]]>([
    ['nothing asked', 0, []],
    ['the middle frame of each scene when enough slots', 9, [2, 4, 5, 6]],
    ['evenly spread scenes when fewer slots', 2, [2, 5]],
  ])('%s', (_, count, expected) => {
    expect(sceneSamplesOf(scenes, count).map((frame) => frame.id)).toEqual(expected);
  });
});

describe('frameNumberOf', () => {
  it.each<[number, string]>([
    [7, '0007'],
    [847, '0847'],
    [12345, '12345'],
  ])('%i → %s', (number, expected) => {
    expect(frameNumberOf(number)).toBe(expected);
  });
});
