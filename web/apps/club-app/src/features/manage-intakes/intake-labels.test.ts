import { describe, expect, it } from 'vitest';
import { toAddressLine } from './intake-labels';

describe('toAddressLine', () => {
  it.each([
    ['Lindenweg 4', '99706', 'Großfurra', 'Lindenweg 4, 99706 Großfurra'],
    [null, '99706', 'Großfurra', '99706 Großfurra'],
    ['Lindenweg 4', null, null, 'Lindenweg 4'],
    [null, null, null, '–'],
  ])('formats %s / %s / %s', (street, zip, city, expected) => {
    expect(toAddressLine(street, zip, city)).toBe(expected);
  });
});
