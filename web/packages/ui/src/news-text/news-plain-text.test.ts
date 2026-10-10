import { describe, expect, it } from 'vitest';
import { newsPlainTextOf } from './news-plain-text';

describe('newsPlainTextOf', () => {
  it.each([
    ['nothing', '', ''],
    [
      'markup dropped, mention labels kept',
      '## Titel\n\n**Fett** mit @[Elferrat](group:1)\n\n- a\n- b',
      'Titel Fett mit Elferrat a b',
    ],
    ['link labels kept', 'Siehe [hier](https://furria.de).', 'Siehe hier.'],
  ])('reads %s', (_, text, expected) => {
    expect(newsPlainTextOf(text)).toBe(expected);
  });
});
