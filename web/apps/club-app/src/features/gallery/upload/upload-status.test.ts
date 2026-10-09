import { describe, expect, it } from 'vitest';
import type { UploadTally } from './upload-queue';
import type { UploadStatus } from './upload-status';
import { uploadStatusOf } from './upload-status';

const MB = 1024 * 1024;

describe('uploadStatusOf', () => {
  it.each<[string, UploadTally, boolean, number, UploadStatus]>([
    [
      'nothing queued',
      {
        total: 0,
        sent: 0,
        active: 0,
        streaming: 0,
        failed: 0,
        refused: 2,
        bytesTotal: 0,
        bytesSent: 0,
      },
      false,
      0,
      { kind: 'empty' },
    ],
    [
      'running with a measured speed',
      {
        total: 10,
        sent: 4,
        active: 6,
        streaming: 4,
        failed: 0,
        refused: 0,
        bytesTotal: 100 * MB,
        bytesSent: 40 * MB,
      },
      false,
      MB,
      { kind: 'running', sent: 4, total: 10, share: 0.4, minutes: 1, streams: 4 },
    ],
    [
      'running before any speed is known',
      {
        total: 2,
        sent: 0,
        active: 2,
        streaming: 2,
        failed: 0,
        refused: 0,
        bytesTotal: 10 * MB,
        bytesSent: 0,
      },
      false,
      0,
      { kind: 'running', sent: 0, total: 2, share: 0, minutes: null, streams: 2 },
    ],
    [
      'offline',
      {
        total: 4,
        sent: 1,
        active: 3,
        streaming: 3,
        failed: 0,
        refused: 0,
        bytesTotal: 4 * MB,
        bytesSent: MB,
      },
      true,
      MB,
      { kind: 'paused', sent: 1, total: 4, share: 0.25 },
    ],
    [
      'only failures left',
      {
        total: 3,
        sent: 2,
        active: 0,
        streaming: 0,
        failed: 1,
        refused: 0,
        bytesTotal: 3 * MB,
        bytesSent: 2 * MB,
      },
      true,
      0,
      { kind: 'finished', sent: 2, total: 3 },
    ],
  ])('%s', (_, tally, paused, speed, expected) => {
    expect(uploadStatusOf(tally, paused, speed)).toEqual(expected);
  });
});
