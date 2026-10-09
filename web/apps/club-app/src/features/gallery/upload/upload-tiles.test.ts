import { describe, expect, it } from 'vitest';
import type { UploadEntry } from './upload-queue';
import type { DevelopedItem, UploadTileLook } from './upload-tiles';
import { tileLookOf } from './upload-tiles';

const entry = (
  phase: UploadEntry['phase'],
  sent: number,
  failure: UploadEntry['failure'] = null,
): UploadEntry => ({
  key: 7,
  name: 'IMG_0007.JPG',
  size: 200,
  kind: 'photo',
  capturedAt: '2026-02-14T20:41:00',
  preview: 'blob:local',
  phase,
  sent,
  failure,
  mediaItemId: phase === 'sent' ? 41 : null,
  albumId: null,
});

describe('tileLookOf', () => {
  it.each<[string, UploadEntry, DevelopedItem | undefined, UploadTileLook]>([
    [
      'queued',
      entry('queued', 0),
      undefined,
      { state: 'queued', progress: 0, source: 'blob:local', retryable: false },
    ],
    [
      'half sent',
      entry('uploading', 50),
      undefined,
      { state: 'uploading', progress: 0.25, source: 'blob:local', retryable: false },
    ],
    [
      'sent, not yet seen by the server',
      entry('sent', 200),
      undefined,
      { state: 'processing', progress: 1, source: 'blob:local', retryable: false },
    ],
    [
      'developing on the server',
      entry('sent', 200),
      { state: 'processing', source: 'https://x/s' },
      { state: 'processing', progress: 1, source: 'blob:local', retryable: false },
    ],
    [
      'developed',
      entry('sent', 200),
      { state: 'ready', source: 'https://x/s' },
      { state: 'ready', progress: 1, source: 'https://x/s', retryable: false },
    ],
    [
      'the worker failed',
      entry('sent', 200),
      { state: 'failed', source: 'https://x/s' },
      { state: 'failed', progress: 1, source: 'blob:local', retryable: false },
    ],
    [
      'interrupted',
      entry('failed', 80, 'interrupted'),
      undefined,
      { state: 'failed', progress: 0, source: 'blob:local', retryable: true },
    ],
    [
      'refused by the server',
      entry('failed', 0, 'notAccepted'),
      undefined,
      { state: 'failed', progress: 0, source: 'blob:local', retryable: false },
    ],
    [
      'refused before sending',
      entry('refused', 0, 'tooLarge'),
      undefined,
      { state: 'failed', progress: 0, source: undefined, retryable: false },
    ],
  ])('%s', (_, upload, developed, expected) => {
    expect(tileLookOf(upload, developed)).toEqual(expected);
  });
});
