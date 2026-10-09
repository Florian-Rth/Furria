import { describe, expect, it } from 'vitest';
import { toParagraphs } from './paragraphs';

describe('toParagraphs', () => {
  it.each([
    [null, null],
    ['  \n\n ', null],
    ['Erster.\n\nZweiter.', ['Erster.', 'Zweiter.']],
    ['Erster.\n  \n\nZweiter.\nNoch zweiter.', ['Erster.', 'Zweiter.\nNoch zweiter.']],
  ])('splits %j into its paragraphs', (text, paragraphs) => {
    expect(toParagraphs(text)).toEqual(paragraphs);
  });
});
