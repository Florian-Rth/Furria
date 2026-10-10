import { describe, expect, it } from 'vitest';
import { newsReadingMinutesOf } from './news-reading-time';

const words = (count: number): string => Array.from({ length: count }, () => 'Wort').join(' ');

describe('newsReadingMinutesOf', () => {
  it.each([
    [words(360), null],
    [words(361), 3],
    [`${words(200)}\n\n**${words(200)}**\n\n- ${words(200)}`, 4],
  ])('reads %#. text in %s minutes', (text, minutes) => {
    expect(newsReadingMinutesOf(text)).toBe(minutes);
  });
});
