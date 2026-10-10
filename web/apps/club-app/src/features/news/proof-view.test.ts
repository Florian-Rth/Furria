import { describe, expect, it } from 'vitest';
import {
  clockLabelOf,
  isProofChanged,
  longDateLabelOf,
  proofDayOf,
  proofPictureSourceOf,
  shortDateLabelOf,
} from './proof-view';
import type { NewsPicture, NewsVersionPart } from './types';

const pictureIn = (state: NewsPicture['state'], source: string | null): NewsPicture => ({
  key: 'picture-1',
  state,
  progress: 1,
  uncroppedSource: 'uncropped.jpg',
  source,
  crop: null,
});

describe('proofPictureSourceOf', () => {
  it.each<{ label: string; picture: NewsPicture | null; expected: string | null }>([
    { label: 'no picture', picture: null, expected: null },
    { label: 'an upload in flight', picture: pictureIn('uploading', null), expected: null },
    { label: 'a developing picture', picture: pictureIn('developing', 'old.jpg'), expected: null },
    { label: 'a failed upload', picture: pictureIn('failed', null), expected: null },
    { label: 'a ready picture', picture: pictureIn('ready', 'ready.jpg'), expected: 'ready.jpg' },
  ])('is $expected for $label', ({ picture, expected }) => {
    expect(proofPictureSourceOf({ picture })).toBe(expected);
  });
});

describe('isProofChanged', () => {
  it.each<{ parts: NewsVersionPart[]; expected: boolean }>([
    { parts: [], expected: false },
    { parts: ['text', 'caption', 'event', 'album'], expected: false },
    { parts: ['text', 'teaser'], expected: true },
    { parts: ['picture'], expected: true },
    { parts: ['category'], expected: true },
  ])('is $expected for $parts', ({ parts, expected }) => {
    expect(isProofChanged(parts)).toBe(expected);
  });
});

describe('proofDayOf', () => {
  it('takes the publication date once there is one', () => {
    expect(proofDayOf('2026-07-18T10:11:00', new Date(2026, 9, 9))).toEqual(
      new Date('2026-07-18T10:11:00'),
    );
  });

  it('previews today before the first publication', () => {
    expect(proofDayOf(null, new Date(2026, 9, 9))).toEqual(new Date(2026, 9, 9));
  });
});

describe('date labels', () => {
  it('formats the long date the way the website does', () => {
    expect(longDateLabelOf(new Date(2026, 6, 18))).toBe('18. Juli 2026');
  });

  it('formats the short date of the list row', () => {
    expect(shortDateLabelOf(new Date(2026, 6, 8))).toBe('08.07.');
  });

  it('formats the clock of the chat bubble', () => {
    expect(clockLabelOf(new Date(2026, 9, 9, 9, 5))).toBe('09:05');
  });
});
