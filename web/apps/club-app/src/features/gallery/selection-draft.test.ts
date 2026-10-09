import { describe, expect, it } from 'vitest';
import type { AlbumItem } from './schemas';
import type { PublicationState, SelectionEntry } from './selection-draft';
import {
  addEntries,
  isSelectionDirty,
  marksTitlePhoto,
  moveEntry,
  pickableItemsOf,
  publicationStateOf,
  selectionDraftOf,
  selectionSlotsOf,
  toggleId,
  toSelectionPhotos,
} from './selection-draft';

const itemOf = (
  mediaItemId: number,
  selectionPosition: number | null,
  caption: string | null = null,
  kind: AlbumItem['kind'] = 'photo',
  state: AlbumItem['state'] = 'ready',
): AlbumItem => ({
  mediaItemId,
  kind,
  state,
  width: 4000,
  height: 3000,
  durationSeconds: null,
  capturedAt: null,
  uploadedAt: '2026-02-14T20:00:00Z',
  camera: null,
  originalFileName: `IMG_${mediaItemId}.jpg`,
  uploader: null,
  selectionPosition,
  caption,
  urls: {
    small: '/s',
    medium: '/m',
    large: '/l',
    poster: null,
    video: null,
    original: '/o',
    download: '/o?download',
  },
});

describe('selectionDraftOf', () => {
  it('orders the selected items by their position and drops the rest', () => {
    const draft = selectionDraftOf([itemOf(1, 2, 'b'), itemOf(2, null), itemOf(3, 1)]);

    expect(draft).toEqual([
      { mediaItemId: 3, caption: '' },
      { mediaItemId: 1, caption: 'b' },
    ]);
  });
});

describe('isSelectionDirty', () => {
  const saved: SelectionEntry[] = [
    { mediaItemId: 1, caption: 'a' },
    { mediaItemId: 2, caption: '' },
  ];

  it.each<[string, SelectionEntry[], boolean]>([
    ['same list', saved, false],
    [
      'caption padded only',
      [
        { mediaItemId: 1, caption: ' a ' },
        { mediaItemId: 2, caption: '' },
      ],
      false,
    ],
    ['reordered', [...saved].reverse(), true],
    [
      'caption changed',
      [
        { mediaItemId: 1, caption: 'x' },
        { mediaItemId: 2, caption: '' },
      ],
      true,
    ],
    ['shorter', [{ mediaItemId: 1, caption: 'a' }], true],
  ])('%s', (_case, draft, expected) => {
    expect(isSelectionDirty(draft, saved)).toBe(expected);
  });
});

describe('moveEntry', () => {
  it.each<[number, number, string[]]>([
    [0, 2, ['b', 'c', 'a', 'd']],
    [3, 0, ['d', 'a', 'b', 'c']],
    [1, 1, ['a', 'b', 'c', 'd']],
    [2, 9, ['a', 'b', 'd', 'c']],
    [1, -4, ['b', 'a', 'c', 'd']],
  ])('moves %i to %i', (from, to, expected) => {
    expect(moveEntry(['a', 'b', 'c', 'd'], from, to)).toEqual(expected);
  });
});

describe('addEntries', () => {
  it('appends only photos not yet in the selection', () => {
    expect(addEntries([{ mediaItemId: 1, caption: 'a' }], [1, 4, 5])).toEqual([
      { mediaItemId: 1, caption: 'a' },
      { mediaItemId: 4, caption: '' },
      { mediaItemId: 5, caption: '' },
    ]);
  });
});

describe('toSelectionPhotos', () => {
  it('trims captions and sends blanks as none', () => {
    expect(
      toSelectionPhotos([
        { mediaItemId: 1, caption: '  Elferrat  ' },
        { mediaItemId: 2, caption: '   ' },
      ]),
    ).toEqual([
      { mediaItemId: 1, caption: 'Elferrat' },
      { mediaItemId: 2, caption: null },
    ]);
  });
});

describe('publicationStateOf', () => {
  const one: SelectionEntry[] = [{ mediaItemId: 1, caption: '' }];

  it.each<[string, number | null, string | null, SelectionEntry[], boolean, PublicationState]>([
    ['published and saved', 2025, '2026-02-15T10:00:00Z', one, false, { kind: 'published' }],
    ['no session', null, null, one, false, { kind: 'noSession' }],
    ['empty selection', 2025, null, [], false, { kind: 'empty' }],
    ['unsaved changes', 2025, null, one, true, { kind: 'unsaved' }],
    ['published but edited', 2025, '2026-02-15T10:00:00Z', one, true, { kind: 'unsaved' }],
    ['ready', 2025, null, one, false, { kind: 'ready' }],
  ])('%s', (_case, sessionStartYear, publishedAt, draft, dirty, expected) => {
    expect(publicationStateOf({ sessionStartYear, publishedAt }, draft, dirty)).toEqual(expected);
  });
});

describe('pickableItemsOf', () => {
  it('offers ready photos outside the selection only', () => {
    const items = [
      itemOf(1, 1),
      itemOf(2, null),
      itemOf(3, null, null, 'video'),
      itemOf(4, null, null, 'photo', 'processing'),
      itemOf(5, null),
    ];

    expect(
      pickableItemsOf(items, [{ mediaItemId: 1, caption: '' }]).map((item) => item.mediaItemId),
    ).toEqual([2, 5]);
  });
});

describe('marksTitlePhoto', () => {
  it.each<[number | null, number, boolean]>([
    [null, 1, true],
    [null, 2, false],
    [7, 1, false],
  ])('chosen cover %s at position %i', (chosenCoverMediaItemId, position, expected) => {
    expect(marksTitlePhoto({ chosenCoverMediaItemId }, position)).toBe(expected);
  });
});

describe('toggleId', () => {
  it.each<[number[], number, number[]]>([
    [[1, 2], 3, [1, 2, 3]],
    [[1, 2], 2, [1]],
  ])('toggles %j with %i', (chosen, id, expected) => {
    expect([...toggleId(new Set(chosen), id)]).toEqual(expected);
  });
});

describe('selectionSlotsOf', () => {
  it('numbers the slots of items still in the album in draft order', () => {
    const slots = selectionSlotsOf(
      [
        { mediaItemId: 3, caption: '' },
        { mediaItemId: 99, caption: '' },
        { mediaItemId: 1, caption: '' },
      ],
      [itemOf(1, null), itemOf(3, null)],
    );

    expect(slots.map((slot) => [slot.item.mediaItemId, slot.position])).toEqual([
      [3, 1],
      [1, 2],
    ]);
  });
});
