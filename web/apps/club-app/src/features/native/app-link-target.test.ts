import { describe, expect, it } from 'vitest';
import { appLinkTargetOf } from './app-link-target';

describe('appLinkTargetOf', () => {
  it.each([
    [
      'an invitation link with its fragment',
      'https://club.furria.test/invitation#token=aB3-_x9Q',
      'https://club.furria.test',
      '/invitation#token=aB3-_x9Q',
    ],
    [
      'a link with a search and a fragment',
      'https://club.furria.test/invitation?from=mail#token=aB3',
      'https://club.furria.test',
      '/invitation?from=mail#token=aB3',
    ],
    [
      'a link with several trailing slashes',
      'https://club.furria.test/reset-password//?a=1',
      'https://club.furria.test',
      '/reset-password?a=1',
    ],
    [
      'a base URL with a trailing slash',
      'https://club.furria.test/invitation#token=aB3',
      'https://club.furria.test/',
      '/invitation#token=aB3',
    ],
    [
      'a foreign host',
      'https://evil.example/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    [
      'a path that is not mailed',
      'https://club.furria.test/members/12',
      'https://club.furria.test',
      null,
    ],
    [
      'a custom scheme',
      'furria://club.furria.test/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    ['an unparseable link', 'not a url', 'https://club.furria.test', null],
    ['a base URL that is no web URL', 'furria://club/invitation', 'furria://club', null],
  ])('maps %s', (_case, link, clubAppBaseUrl, expected) => {
    expect(appLinkTargetOf(link, clubAppBaseUrl)).toBe(expected);
  });
});
