import { describe, expect, it } from 'vitest';
import { sanitizeReturnTo, toReturnToParam } from './return-to';

describe('sanitizeReturnTo', () => {
  it.each([
    ['/uebersicht?tab=person#kontakt', '/uebersicht?tab=person#kontakt'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/\u0009//evil.example', '/'],
  ])('sanitizes %o to %s', (raw, expected) => {
    expect(sanitizeReturnTo(raw)).toBe(expected);
  });
});

describe('toReturnToParam', () => {
  it.each([
    ['/login?returnTo=%2Fuebersicht', undefined],
    ['/loginhistorie', '/loginhistorie'],
  ])('turns %o into %o', (raw, expected) => {
    expect(toReturnToParam(raw)).toBe(expected);
  });
});
