import { describe, expect, it } from 'vitest';
import type { FileVerdict, ThroughputSample, UploadEntry } from './upload-queue';
import {
  bytesPerSecondOf,
  keptSamples,
  nextToStart,
  remainingMinutesOf,
  tallyOf,
  verdictOfFile,
} from './upload-queue';

const MB = 1024 * 1024;

const entry = (
  key: number,
  phase: UploadEntry['phase'],
  kind: UploadEntry['kind'],
  capturedAt: string,
  size = 10,
  sent = 0,
): UploadEntry => ({
  key,
  name: `IMG_${key}.JPG`,
  size,
  kind,
  capturedAt,
  preview: undefined,
  phase,
  sent,
  failure: null,
  mediaItemId: null,
  albumId: null,
});

describe('verdictOfFile', () => {
  it.each<[string, string, number, FileVerdict]>([
    ['IMG_0001.JPG', 'image/jpeg', 8 * MB, { kind: 'photo' }],
    ['IMG_0002.HEIC', '', 3 * MB, { kind: 'photo' }],
    ['clip.MOV', 'video/quicktime', 900 * MB, { kind: 'video' }],
    ['clip.bin', 'video/mp4', 900 * MB, { kind: 'video' }],
    ['huge.jpg', 'image/jpeg', 101 * MB, { refused: 'tooLarge' }],
    ['raw.CR3', '', 30 * MB, { refused: 'notAccepted' }],
    ['party.gif', 'image/gif', MB, { refused: 'notAccepted' }],
    ['notes.pdf', 'application/pdf', MB, { refused: 'notAccepted' }],
  ])('%s', (name, type, size, expected) => {
    expect(verdictOfFile(name, type, size)).toEqual(expected);
  });
});

describe('nextToStart', () => {
  it('fills free streams with photos before videos, earliest first', () => {
    const entries = [
      entry(1, 'uploading', 'photo', '2026-02-14T20:00:00'),
      entry(2, 'queued', 'video', '2026-02-14T19:00:00'),
      entry(3, 'queued', 'photo', '2026-02-14T21:00:00'),
      entry(4, 'queued', 'photo', '2026-02-14T20:30:00'),
      entry(5, 'sent', 'photo', '2026-02-14T18:00:00'),
    ];
    expect(nextToStart(entries, 3)).toEqual([4, 3]);
  });

  it('starts nothing while every stream is busy', () => {
    const entries = [
      entry(1, 'uploading', 'photo', '2026-02-14T20:00:00'),
      entry(2, 'queued', 'photo', '2026-02-14T20:01:00'),
    ];
    expect(nextToStart(entries, 1)).toEqual([]);
  });
});

describe('tallyOf', () => {
  it('counts phases and bytes, leaving refused files out of the totals', () => {
    const entries = [
      entry(1, 'sent', 'photo', 'a', 100, 100),
      entry(2, 'uploading', 'photo', 'b', 100, 40),
      entry(3, 'queued', 'video', 'c', 1000, 0),
      entry(4, 'failed', 'photo', 'd', 50, 10),
      entry(5, 'refused', null, 'e', 70, 0),
    ];
    expect(tallyOf(entries)).toEqual({
      total: 4,
      sent: 1,
      active: 2,
      streaming: 1,
      failed: 1,
      refused: 1,
      bytesTotal: 1250,
      bytesSent: 150,
    });
  });
});

describe('throughput', () => {
  it('measures bytes per second across the kept window', () => {
    const samples: ThroughputSample[] = [
      { at: 0, bytes: 0 },
      { at: 5_000, bytes: 10 * MB },
    ];
    const kept = keptSamples(samples, { at: 14_000, bytes: 18 * MB });
    expect(kept.map((sample) => sample.at)).toEqual([5_000, 14_000]);
    expect(bytesPerSecondOf(kept)).toBeCloseTo((8 * MB) / 9);
  });

  it.each<[number, number, number | null]>([
    [0, 100, 0],
    [60 * MB, 0, null],
    [60 * MB, MB, 1],
    [600 * MB, MB, 10],
    [MB, 10 * MB, 1],
  ])('%s bytes left at %s B/s', (left, speed, expected) => {
    expect(remainingMinutesOf(left, speed)).toBe(expected);
  });
});
