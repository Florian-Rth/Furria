import { describe, expect, it } from 'vitest';
import type { BoardPosition } from './website-board';
import { deskFrameOf } from './website-frames';

const shown: BoardPosition = {
  slot: 'gallery.stack',
  slotTitle: 'Fotostapel',
  position: 2,
  count: 3,
  aspect: 'portrait',
  decorative: false,
  status: 'mismatch',
  picture: {
    slot: 'gallery.stack',
    position: 2,
    mediaItemId: 4,
    aspect: 1.4,
    alt: 'Garde',
    picture: {
      state: 'ready',
      picture: { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' },
      uncroppedUrl: '/u',
      crop: null,
    },
    updatedAt: '2026-10-12T10:00:00+00:00',
    updatedBy: null,
  },
  needsAlt: false,
  orphan: false,
};

describe('deskFrameOf', () => {
  it('shows the photo on its way up instead of the stored one while uploading', () => {
    expect(deskFrameOf(shown, { phase: 'uploading', uploadSource: 'blob:x' })).toEqual({
      source: 'blob:x',
      state: 'uploading',
      mark: { kind: 'none' },
    });
  });

  it('shows the stored cut marked for a new cut when its format went stale', () => {
    expect(deskFrameOf(shown, { phase: 'view', uploadSource: null })).toEqual({
      source: '/m',
      state: 'ready',
      mark: { kind: 'recut' },
    });
  });
});
