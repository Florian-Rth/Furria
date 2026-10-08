import { describe, expect, it } from 'vitest';
import type { UploadMoment } from './upload-run';
import { remainingMinutesAt, sentCountAt, uploadMomentAt } from './upload-run';

describe('uploadMomentAt', () => {
  it.each<[string, number, number, boolean, UploadMoment]>([
    ['the fifth file waits for a free stream', 4, 1, false, { phase: 'queued', progress: 0 }],
    ['half sent', 0, 0.8, false, { phase: 'uploading', progress: 0.5 }],
    ['sent and being processed', 0, 2, false, { phase: 'processing', progress: 1 }],
    ['processed', 0, 5, false, { phase: 'ready', progress: 1 }],
    ['sent but refused', 0, 2, true, { phase: 'failed', progress: 1 }],
    ['a failing file still uploads first', 0, 0.4, true, { phase: 'uploading', progress: 0.25 }],
  ])('%s', (_, position, elapsed, failing, expected) => {
    expect(uploadMomentAt(position, elapsed, failing)).toEqual(expected);
  });
});

describe('sentCountAt', () => {
  it.each<[number, number, number]>([
    [0, 902, 0],
    [1.6, 902, 4],
    [3.3, 902, 8],
    [1000, 902, 902],
  ])('after %f s of %i files → %i', (elapsed, total, expected) => {
    expect(sentCountAt(total, elapsed)).toBe(expected);
  });
});

describe('remainingMinutesAt', () => {
  it.each<[number, number, number]>([
    [0, 902, 7],
    [300, 902, 2],
    [1000, 902, 0],
  ])('after %f s of %i files → %i min', (elapsed, total, expected) => {
    expect(remainingMinutesAt(total, elapsed)).toBe(expected);
  });
});
