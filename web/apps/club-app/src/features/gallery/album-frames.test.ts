import { describe, expect, it } from 'vitest';
import type { StrokeMode } from './album-frames';
import {
  albumFramesOf,
  framesAround,
  selectionWith,
  selectionWithout,
  steppedNumber,
  strokeModeOf,
  strokeSelection,
} from './album-frames';
import type { AlbumItem } from './schemas';

const urls = {
  small: 'https://api.test/s',
  medium: null,
  large: null,
  poster: null,
  video: null,
  original: 'https://api.test/o',
  download: 'https://api.test/d',
};

const item = (
  mediaItemId: number,
  selectionPosition: number | null,
  overrides: Partial<AlbumItem> = {},
): AlbumItem => ({
  mediaItemId,
  kind: 'photo',
  state: 'ready',
  width: 4000,
  height: 3000,
  durationSeconds: null,
  capturedAt: null,
  uploadedAt: '2026-02-14T20:00:00Z',
  camera: null,
  originalFileName: `IMG_${mediaItemId}.jpg`,
  uploader: null,
  selectionPosition,
  caption: selectionPosition === null ? null : `Bild ${mediaItemId}`,
  urls,
  ...overrides,
});

describe('albumFramesOf', () => {
  it('numbers frames from one in the given order', () => {
    const frames = albumFramesOf([item(7, null), item(3, null)]);
    expect(frames.map((frame) => [frame.id, frame.number])).toEqual([
      [7, 1],
      [3, 2],
    ]);
  });
});

describe('selectionWith', () => {
  it('appends ready photos in album order behind the kept selection and keeps captions', () => {
    const items = [
      item(1, null),
      item(2, 2),
      item(3, null, { kind: 'video' }),
      item(4, 1),
      item(5, null, { state: 'processing' }),
      item(6, null),
    ];
    expect(selectionWith(items, new Set([6, 1, 3, 5, 2]))).toEqual([
      { mediaItemId: 4, caption: 'Bild 4' },
      { mediaItemId: 2, caption: 'Bild 2' },
      { mediaItemId: 1, caption: null },
      { mediaItemId: 6, caption: null },
    ]);
  });
});

describe('selectionWithout', () => {
  it('drops the given photos and keeps the order of the rest', () => {
    const items = [item(1, 3), item(2, 1), item(3, 2)];
    expect(selectionWithout(items, new Set([3]))).toEqual([
      { mediaItemId: 2, caption: 'Bild 2' },
      { mediaItemId: 1, caption: 'Bild 1' },
    ]);
  });
});

describe('strokeModeOf', () => {
  it.each<[number[], number, StrokeMode]>([
    [[], 1, 'add'],
    [[1], 1, 'remove'],
    [[2], 1, 'add'],
  ])('with %j selected, a stroke from %i is %s', (selected, anchor, mode) => {
    expect(strokeModeOf(new Set(selected), anchor)).toBe(mode);
  });
});

describe('strokeSelection', () => {
  const order = [10, 20, 30, 40, 50];

  it.each<[string, number[], number, number, StrokeMode, number[]]>([
    ['adds the swept range forwards', [50], 20, 40, 'add', [20, 30, 40, 50]],
    ['adds the swept range backwards', [], 40, 20, 'add', [20, 30, 40]],
    ['removes the swept range', [10, 20, 30, 40], 30, 10, 'remove', [40]],
    ['leaves the base for an unknown frame', [10], 20, 99, 'add', [10]],
  ])('%s', (_, base, anchor, current, mode, expected) => {
    expect([...strokeSelection(new Set(base), order, anchor, current, mode)].sort()).toEqual(
      expected,
    );
  });
});

describe('framesAround', () => {
  it('keeps frames within the reach of the shown number', () => {
    const frames = albumFramesOf([item(1, null), item(2, null), item(3, null), item(4, null)]);
    expect(framesAround(frames, 2, 1).map((frame) => frame.number)).toEqual([1, 2, 3]);
  });
});

describe('steppedNumber', () => {
  it.each<[number, number, number, number]>([
    [1, -1, 5, 1],
    [5, 1, 5, 5],
    [3, 1, 5, 4],
  ])('%i stepped by %i of %i is %i', (number, delta, total, expected) => {
    expect(steppedNumber(number, delta, total)).toBe(expected);
  });
});
