import { describe, expect, it } from 'vitest';
import type { DevelopedItems } from './developing-items';
import { developedAfter, mergeItems, POLL_BATCH_LIMIT, pollBatchOf } from './developing-items';
import type { AlbumItem, InboxItem } from './schemas';

const urls = (mediaItemId: number, version: string): InboxItem['urls'] => ({
  small: `/api/media/${mediaItemId}/small?v=${version}`,
  medium: null,
  large: null,
  poster: null,
  video: null,
  original: `/api/media/${mediaItemId}/original?v=${version}`,
  download: `/api/media/${mediaItemId}/original?v=${version}&download`,
});

const inboxItem = (
  mediaItemId: number,
  state: InboxItem['state'],
  capturedAt: string | null,
): InboxItem => ({
  mediaItemId,
  kind: 'photo',
  state,
  width: state === 'ready' ? 4000 : null,
  height: state === 'ready' ? 3000 : null,
  durationSeconds: null,
  capturedAt,
  uploadedAt: '2026-02-15T09:00:00Z',
  camera: null,
  originalFileName: `${mediaItemId}.jpg`,
  urls: urls(mediaItemId, state),
});

const albumItem = (
  mediaItemId: number,
  state: InboxItem['state'],
  capturedAt: string | null,
): AlbumItem => ({
  ...inboxItem(mediaItemId, state, capturedAt),
  uploader: { personId: 7, firstName: 'Anna', lastName: 'König' },
  selectionPosition: mediaItemId,
  caption: `Bild ${mediaItemId}`,
});

describe('pollBatchOf', () => {
  it('polls processing list items and unsettled uploads once each, lowest ids first', () => {
    const developed: DevelopedItems = new Map([
      [20, inboxItem(20, 'ready', null)],
      [21, null],
      [22, inboxItem(22, 'processing', null)],
    ]);

    const batch = pollBatchOf(
      [
        [
          { mediaItemId: 9, state: 'processing' },
          { mediaItemId: 3, state: 'ready' },
        ],
        [
          { mediaItemId: 9, state: 'processing' },
          { mediaItemId: 4, state: 'failed' },
          { mediaItemId: 5, state: 'processing' },
        ],
      ],
      [23, 20, 21, 22, 9],
      developed,
    );

    expect(batch).toEqual([5, 9, 22, 23]);
  });

  it('carries no more than one batch, starting with the oldest uploads', () => {
    const uploaded = Array.from({ length: POLL_BATCH_LIMIT + 50 }, (_, index) => 1000 - index);

    const batch = pollBatchOf([], uploaded, new Map());

    expect(batch).toHaveLength(POLL_BATCH_LIMIT);
    expect(batch[0]).toBe(1000 - POLL_BATCH_LIMIT - 49);
  });
});

describe('mergeItems', () => {
  it('takes the developed state, keeps album fields and drops polled items that are gone', () => {
    const merged = mergeItems(
      [
        albumItem(1, 'ready', '2026-02-14T20:00:00Z'),
        albumItem(2, 'processing', null),
        albumItem(3, 'processing', null),
        albumItem(4, 'processing', null),
      ],
      [2, 3, 4],
      [inboxItem(2, 'ready', '2026-02-14T19:00:00Z'), inboxItem(4, 'processing', null)],
    );

    expect(merged.map((item) => [item.mediaItemId, item.state, item.selectionPosition])).toEqual([
      [2, 'ready', 2],
      [1, 'ready', 1],
      [4, 'processing', 4],
    ]);
    expect(merged[0]?.urls.small).toBe('/api/media/2/small?v=ready');
  });

  it('keeps unpolled items untouched in capture order', () => {
    const items = [inboxItem(1, 'processing', null), inboxItem(2, 'ready', '2026-02-14T20:00:00Z')];

    const merged = mergeItems(items, [], []);

    expect(merged.map((item) => item.mediaItemId)).toEqual([2, 1]);
  });
});

describe('developedAfter', () => {
  it('records answered items and marks polled ids without an answer as gone', () => {
    const developed = developedAfter(
      new Map([[1, inboxItem(1, 'ready', null)]]),
      [2, 3],
      [inboxItem(2, 'failed', null)],
    );

    expect([...developed].map(([id, item]) => [id, item?.state ?? null])).toEqual([
      [1, 'ready'],
      [2, 'failed'],
      [3, null],
    ]);
  });
});
