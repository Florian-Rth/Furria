import { describe, expect, it } from 'vitest';
import type {
  MediaUpload,
  TransportEvents,
  UploadOutcome,
  UploadProgress,
  UploadTransport,
} from './media-upload';
import { uploadVia } from './media-upload';

interface Opened {
  events: TransportEvents;
  metadata: Record<string, string>;
}

interface FakeTransport {
  transport: UploadTransport;
  opened: () => Opened;
  stops: boolean[];
}

const fakeTransport = (): FakeTransport => {
  let opened: Opened | null = null;
  const stops: boolean[] = [];
  return {
    transport: (_file, metadata, events) => {
      opened = { events, metadata };
      return {
        stop: (discard) => {
          stops.push(discard);
        },
      };
    },
    opened: () => {
      if (opened === null) {
        throw new Error('transport was never opened');
      }
      return opened;
    },
    stops,
  };
};

const photo = new File(['x'], 'IMG_0001.HEIC');

describe('uploadVia', () => {
  it.each<[string, MediaUpload, Record<string, string>]>([
    [
      'a portrait with its cut',
      {
        file: photo,
        owner: { kind: 'person', id: 7 },
        crop: { left: 0, top: 0.25, width: 1, height: 0.5 },
      },
      { owner: 'person:7', filename: 'IMG_0001.HEIC', crop: '0,0.25,1,0.5' },
    ],
    [
      'a group picture left to the server to cut',
      { file: photo, owner: { kind: 'group', id: 3 }, crop: null },
      { owner: 'group:3', filename: 'IMG_0001.HEIC' },
    ],
    [
      'a news picture',
      { file: photo, owner: { kind: 'news', id: 12 } },
      { owner: 'news:12', filename: 'IMG_0001.HEIC' },
    ],
    [
      'a gallery photo into an album',
      { file: photo, owner: { kind: 'gallery', albumId: 5 } },
      { owner: 'gallery', filename: 'IMG_0001.HEIC', album: '5' },
    ],
    [
      'a gallery photo into the inbox',
      { file: photo, owner: { kind: 'gallery', albumId: null } },
      { owner: 'gallery', filename: 'IMG_0001.HEIC' },
    ],
  ])('describes %s to the server', (_, upload, metadata) => {
    const fake = fakeTransport();
    uploadVia(fake.transport, upload);
    expect(fake.opened().metadata).toEqual(metadata);
  });

  it.each<[number | null, UploadOutcome]>([
    [413, { kind: 'failed', failure: 'tooLarge' }],
    [415, { kind: 'failed', failure: 'notAccepted' }],
    [403, { kind: 'failed', failure: 'notAllowed' }],
    [404, { kind: 'failed', failure: 'gone' }],
    [500, { kind: 'failed', failure: 'interrupted' }],
    [null, { kind: 'failed', failure: 'interrupted' }],
  ])('reads a refusal with status %s', async (status, outcome) => {
    const fake = fakeTransport();
    const handle = uploadVia(fake.transport, { file: photo, owner: { kind: 'person', id: 7 } });
    fake.opened().events.onError(status);
    await expect(handle.done).resolves.toEqual(outcome);
  });

  it('reports progress until sent and names the developing item', async () => {
    const fake = fakeTransport();
    const handle = uploadVia(fake.transport, { file: photo, owner: { kind: 'news', id: 1 } });
    const seen: UploadProgress[] = [];
    handle.progress((progress) => {
      seen.push(progress);
    });
    const { events } = fake.opened();
    events.onProgress(0, 0);
    events.onProgress(25, 100);
    events.onSuccess(41);
    events.onProgress(100, 100);
    expect(seen).toEqual([
      { sent: 0, total: 0, share: 0 },
      { sent: 25, total: 100, share: 0.25 },
    ]);
    await expect(handle.done).resolves.toEqual({ kind: 'sent', mediaItemId: 41 });
  });

  it.each<[string, 'cancel' | 'pause', boolean]>([
    ['cancelling discards the partial upload', 'cancel', true],
    ['pausing keeps the partial upload to resume later', 'pause', false],
  ])('%s', async (_, stop, discard) => {
    const fake = fakeTransport();
    const handle = uploadVia(fake.transport, {
      file: photo,
      owner: { kind: 'gallery', albumId: null },
    });
    handle[stop]();
    handle.cancel();
    fake.opened().events.onError(500);
    expect(fake.stops).toEqual([discard]);
    await expect(handle.done).resolves.toEqual({ kind: 'stopped' });
  });

  it('leaves a settled upload alone when stopped afterwards', async () => {
    const fake = fakeTransport();
    const handle = uploadVia(fake.transport, { file: photo, owner: { kind: 'group', id: 3 } });
    fake.opened().events.onSuccess(null);
    handle.cancel();
    expect(fake.stops).toEqual([]);
    await expect(handle.done).resolves.toEqual({ kind: 'sent', mediaItemId: null });
  });
});
