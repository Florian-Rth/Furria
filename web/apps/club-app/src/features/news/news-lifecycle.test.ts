import { describe, expect, it } from 'vitest';
import type { PictureEditing } from '@/lib/api/schemas';
import {
  changedPartsOf,
  isChangedBlock,
  missingOf,
  pictureKeyOf,
  pictureOf,
  stageOf,
} from './news-lifecycle';
import type { NewsVersion } from './types';

const version = (fields: Partial<NewsVersion>): NewsVersion => ({
  category: 'session',
  title: 'Prinzenpaar proklamiert',
  teaser: 'Um 11:11 Uhr.',
  text: 'Erster Absatz.\n\nZweiter Absatz.',
  picture: null,
  pictureCaption: '',
  eventId: null,
  albumId: null,
  event: null,
  album: null,
  ...fields,
});

const editing = (fields: Partial<PictureEditing>): PictureEditing => ({
  state: 'ready',
  picture: {
    smallUrl: '/api/media/7/small?exp=1&sig=a&v=100',
    mediumUrl: '/api/media/7/medium?exp=1&sig=a&v=100',
    largeUrl: '/api/media/7/large?exp=1&sig=a&v=100',
  },
  uncroppedUrl: '/api/media/7/uncropped?exp=1&sig=a&v=100',
  crop: { left: 0, top: 0.1, width: 1, height: 0.5 },
  ...fields,
});

describe('stageOf', () => {
  it.each([
    ['draft', false, 'draft'],
    ['published', false, 'live'],
    ['published', true, 'pending'],
    ['withdrawn', false, 'withdrawn'],
  ] as const)('%s with pending changes %s is %s', (state, hasPendingChanges, expected) => {
    expect(stageOf(state, hasPendingChanges)).toBe(expected);
  });
});

describe('missingOf', () => {
  it('names every unmet requirement', () => {
    expect(missingOf(version({ category: null, title: ' ', teaser: '', text: '' }))).toEqual([
      'category',
      'title',
      'teaser',
      'text',
    ]);
  });

  it('is empty for a complete version without a picture', () => {
    expect(missingOf(version({}))).toEqual([]);
  });
});

describe('isChangedBlock', () => {
  const live = new Set(['Erster Absatz.', '## Zwischentitel']);

  it.each([
    { block: 'Erster Absatz.', changed: false },
    { block: '  Erster Absatz.  ', changed: false },
    { block: 'Erster Absatz, neu.', changed: true },
    { block: '', changed: false },
    { block: '   ', changed: false },
  ])('treats "$block" as changed: $changed', ({ block, changed }) => {
    expect(isChangedBlock(block, live)).toBe(changed);
  });
});

describe('pictureKeyOf', () => {
  it('ignores a fresh signature on the same picture', () => {
    const signedAgain = editing({ uncroppedUrl: '/api/media/7/uncropped?exp=2&sig=b&v=100' });

    expect(pictureKeyOf(signedAgain)).toBe(pictureKeyOf(editing({})));
  });

  it.each([
    ['another media item', editing({ uncroppedUrl: '/api/media/8/uncropped?exp=1&sig=a&v=100' })],
    ['a new rendering', editing({ uncroppedUrl: '/api/media/7/uncropped?exp=1&sig=a&v=200' })],
    ['another crop', editing({ crop: { left: 0, top: 0, width: 1, height: 0.5 } })],
  ])('tells %s apart', (_, other) => {
    expect(pictureKeyOf(other)).not.toBe(pictureKeyOf(editing({})));
  });
});

describe('pictureOf', () => {
  it.each([
    ['ready', editing({}), 'ready'],
    [
      'processing',
      editing({ state: 'processing', picture: null, uncroppedUrl: null }),
      'developing',
    ],
    ['failed', editing({ state: 'failed', picture: null, uncroppedUrl: null }), 'failed'],
  ] as const)('shows a %s picture as %s', (_, subject, expected) => {
    expect(pictureOf(subject)?.state).toBe(expected);
  });
});

describe('changedPartsOf', () => {
  it('lists every part that differs from the live version', () => {
    expect(
      changedPartsOf(version({}), version({ title: 'Neu', albumId: 4, pictureCaption: 'Foto: X' })),
    ).toEqual(['title', 'caption', 'album']);
  });

  it('sees a re-cropped picture as changed', () => {
    const live = version({ picture: pictureOf(editing({})) });
    const recropped = version({
      picture: pictureOf(editing({ crop: { left: 0, top: 0, width: 1, height: 0.5 } })),
    });

    expect(changedPartsOf(live, recropped)).toEqual(['picture']);
  });
});
