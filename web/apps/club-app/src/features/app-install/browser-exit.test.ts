import { describe, expect, it } from 'vitest';
import { browserExitHrefOf } from './browser-exit';

describe('browserExitHrefOf', () => {
  it.each([
    {
      exit: 'safari',
      href: 'https://app.furria.de/calendar?view=list#top',
      expected: 'x-safari-https://app.furria.de/calendar?view=list',
    },
    {
      exit: 'chrome',
      href: 'https://app.furria.de/',
      expected: 'intent://app.furria.de/#Intent;scheme=https;package=com.android.chrome;end',
    },
    {
      exit: 'chrome',
      href: 'https://app.furria.de:8443/news?post=4',
      expected:
        'intent://app.furria.de:8443/news?post=4#Intent;scheme=https;package=com.android.chrome;end',
    },
  ] as const)('$exit $href', ({ exit, href, expected }) => {
    expect(browserExitHrefOf(exit, href)).toBe(expected);
  });
});
