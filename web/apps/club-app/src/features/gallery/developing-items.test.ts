import { describe, expect, it } from 'vitest';
import { mergeItems } from './developing-items';
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
  isStalled: false,
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
});
