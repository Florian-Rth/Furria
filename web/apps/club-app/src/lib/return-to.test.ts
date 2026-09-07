import { describe, expect, it } from 'vitest';
import { sanitizeReturnTo, toReturnToParam } from './return-to';

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

describe('toReturnToParam', () => {
  it.each([
    [undefined, undefined],
    ['/', undefined],
    ['/uebersicht', '/uebersicht'],
    ['/uebersicht?tab=person', '/uebersicht?tab=person'],
    ['/login', undefined],
    ['/login?returnTo=%2Fuebersicht', undefined],
    ['/login#anker', undefined],
    ['/loginhistorie', '/loginhistorie'],
    ['https://evil.example/uebersicht', undefined],
  ])('turns %o into %o', (raw, expected) => {
    expect(toReturnToParam(raw)).toBe(expected);
  });
});

describe('toReturnToParam idempotence', () => {
  it.each([['/uebersicht'], ['/uebersicht?tab=person#kontakt'], ['/login'], ['//evil.example']])(
    're-reads its own output for %s unchanged',
    (raw) => {
      const once = toReturnToParam(raw);
      expect(toReturnToParam(once)).toBe(once);
    },
  );
});
