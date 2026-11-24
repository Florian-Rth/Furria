import { describe, expect, it } from 'vitest';
import type { PictureEditing } from '@/lib/api/schemas';
import { changedPartsOf, missingOf, pictureKeyOf, pictureOf } from './news-lifecycle';
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
  isStalled: false,
  picture: {
    smallUrl: '/api/media/7/small?exp=1&sig=a&v=100',
    mediumUrl: '/api/media/7/medium?exp=1&sig=a&v=100',
    largeUrl: '/api/media/7/large?exp=1&sig=a&v=100',
  },
  uncroppedUrl: '/api/media/7/uncropped?exp=1&sig=a&v=100',
  crop: { left: 0, top: 0.1, width: 1, height: 0.5 },
  ...fields,
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
});

describe('pictureKeyOf', () => {
  it('ignores a fresh signature on the same picture', () => {
    const signedAgain = editing({ uncroppedUrl: '/api/media/7/uncropped?exp=2&sig=b&v=100' });

    expect(pictureKeyOf(signedAgain)).toBe(pictureKeyOf(editing({})));
  });

  it.each([
    ['a new rendering', editing({ uncroppedUrl: '/api/media/7/uncropped?exp=1&sig=a&v=200' })],
  ])('tells %s apart', (_, other) => {
    expect(pictureKeyOf(other)).not.toBe(pictureKeyOf(editing({})));
  });
});

describe('changedPartsOf', () => {
  it('sees a re-cropped picture as changed', () => {
    const live = version({ picture: pictureOf(editing({})) });
    const recropped = version({
      picture: pictureOf(editing({ crop: { left: 0, top: 0, width: 1, height: 0.5 } })),
    });

    expect(changedPartsOf(live, recropped)).toEqual(['picture']);
  });
});
