import { describe, expect, it } from 'vitest';
import { readingMinutesOf } from './reading-time';

const words = (count: number): string => Array.from({ length: count }, () => 'Wort').join(' ');

describe('readingMinutesOf', () => {
  it.each([
    [words(360), null],
    [words(361), 3],
    [`${words(200)}\n\n**${words(200)}**\n\n- ${words(200)}`, 4],
  ])('reads %#. text in %s minutes', (text, minutes) => {
    expect(readingMinutesOf(text, ['group', 'person'])).toBe(minutes);
  });
});
