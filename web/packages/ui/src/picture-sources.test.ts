import { describe, expect, it } from 'vitest';
import { toPictureSourceSet } from './picture-sources';

const URLS = { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' };

describe('toPictureSourceSet', () => {
  it.each([
    ['a portrait, whose long edge is its height', 4 / 5, '/s 320w, /m 1280w, /l 2048w'],
    ['a group picture, whose long edge is its width', 3 / 2, '/s 400w, /m 1600w, /l 2560w'],
  ])('names each rendition by its width for %s', (_, aspect, expected) => {
    expect(toPictureSourceSet(URLS, aspect)).toBe(expected);
  });
});
