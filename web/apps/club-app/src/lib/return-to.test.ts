import { describe, expect, it } from 'vitest';
import { sanitizeReturnTo } from './return-to';

describe('sanitizeReturnTo', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['/', '/'],
    ['/uebersicht', '/uebersicht'],
    ['/uebersicht?tab=person#kontakt', '/uebersicht?tab=person#kontakt'],
    ['  /uebersicht  ', '/uebersicht'],
    ['uebersicht', '/'],
    ['//evil.example', '/'],
    ['///evil.example', '/'],
    ['http://evil.example/uebersicht', '/'],
    ['https://evil.example', '/'],
    ['javascript:alert(1)', '/'],
    ['\\\\evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/uebersicht\\..\\evil', '/'],
    ['/\u0009//evil.example', '/'],
    ['/uebersicht\u000abody', '/'],
  ])('sanitizes %o to %s', (raw, expected) => {
    expect(sanitizeReturnTo(raw)).toBe(expected);
  });
});
