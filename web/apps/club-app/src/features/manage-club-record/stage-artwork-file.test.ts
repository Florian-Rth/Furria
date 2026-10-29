import { describe, expect, it } from 'vitest';
import {
  STAGE_ARTWORK_MAX_LENGTH,
  stageArtworkFileRejectionOf,
  stageArtworkTextRejectionOf,
} from './stage-artwork-file';

describe('stageArtworkFileRejectionOf', () => {
  it.each([
    { name: 'buehne.svg', type: 'image/svg+xml', size: 1_000, expected: null },
    { name: 'buehne.SVG', type: '', size: 1_000, expected: null },
    { name: 'buehne', type: 'image/svg+xml', size: STAGE_ARTWORK_MAX_LENGTH, expected: null },
    {
      name: 'buehne.svg',
      type: 'image/svg+xml',
      size: STAGE_ARTWORK_MAX_LENGTH + 1,
      expected: 'too-large',
    },
    { name: 'buehne.svg', type: '', size: STAGE_ARTWORK_MAX_LENGTH + 1, expected: 'too-large' },
    { name: 'buehne.png', type: 'image/png', size: 1_000, expected: 'wrong-type' },
    { name: 'buehne', type: '', size: 1_000, expected: 'wrong-type' },
    { name: 'buehne.svg.png', type: '', size: 1_000, expected: 'wrong-type' },
  ])('judges $name ($type, $size bytes) as $expected', ({ name, type, size, expected }) => {
    expect(stageArtworkFileRejectionOf({ name, type, size })).toBe(expected);
  });
});

describe('stageArtworkTextRejectionOf', () => {
  it.each([
    { text: '<svg viewBox="0 0 4 3"></svg>', expected: null },
    { text: '\n<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"/>', expected: null },
    { text: '', expected: 'not-svg' },
    { text: '   \n ', expected: 'not-svg' },
    { text: '<html><body></body></html>', expected: 'not-svg' },
    { text: 'svg', expected: 'not-svg' },
  ])('judges $text as $expected', ({ text, expected }) => {
    expect(stageArtworkTextRejectionOf(text)).toBe(expected);
  });
});
