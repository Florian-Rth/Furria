import { describe, expect, it } from 'vitest';
import { sanitizeReturnTo, toReturnToParam } from './return-to';

describe('sanitizeReturnTo', () => {
  it.each([
    [undefined, '/'],
    ['/uebersicht?tab=person#kontakt', '/uebersicht?tab=person#kontakt'],
    ['  /uebersicht  ', '/uebersicht'],
    ['uebersicht', '/'],
    ['//evil.example', '/'],
    ['https://evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/\u0009//evil.example', '/'],
    ['/uebersicht\u007f', '/'],
  ])('sanitizes %o to %s', (raw, expected) => {
    expect(sanitizeReturnTo(raw)).toBe(expected);
  });
});

describe('toReturnToParam', () => {
  it.each([
    ['/', undefined],
    ['/uebersicht?tab=person', '/uebersicht?tab=person'],
    ['/login?returnTo=%2Fuebersicht', undefined],
    ['/login#anker', undefined],
    ['/loginhistorie', '/loginhistorie'],
    ['https://evil.example/uebersicht', undefined],
  ])('turns %o into %o', (raw, expected) => {
    expect(toReturnToParam(raw)).toBe(expected);
  });
});
