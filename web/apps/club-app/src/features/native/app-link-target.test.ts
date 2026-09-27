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
      'a password-reset link with its fragment',
      'https://club.furria.test/reset-password#reset=AAAAB3-_x9Q',
      'https://club.furria.test',
      '/reset-password#reset=AAAAB3-_x9Q',
    ],
    [
      'a link with a search and a fragment',
      'https://club.furria.test/invitation?from=mail#token=aB3',
      'https://club.furria.test',
      '/invitation?from=mail#token=aB3',
    ],
    [
      'a link with a trailing slash',
      'https://club.furria.test/invitation/#token=aB3',
      'https://club.furria.test',
      '/invitation#token=aB3',
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
      'a host in another case',
      'https://CLUB.furria.test/invitation#token=aB3',
      'https://club.furria.test',
      '/invitation#token=aB3',
    ],
    [
      'a foreign host',
      'https://evil.example/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    [
      'a subdomain of the club-app host',
      'https://x.club.furria.test/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    [
      'another scheme on the club-app host',
      'http://club.furria.test/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    [
      'another port on the club-app host',
      'https://club.furria.test:8443/invitation#token=aB3',
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
      'the in-person code entry, which is never mailed',
      'https://club.furria.test/invitation/code',
      'https://club.furria.test',
      null,
    ],
    ['the bare host', 'https://club.furria.test/', 'https://club.furria.test', null],
    [
      'a custom scheme',
      'furria://club.furria.test/invitation#token=aB3',
      'https://club.furria.test',
      null,
    ],
    ['an unparseable link', 'not a url', 'https://club.furria.test', null],
    ['no configured base URL', 'https://club.furria.test/invitation#token=aB3', '', null],
    ['a base URL that is no web URL', 'furria://club/invitation', 'furria://club', null],
  ])('maps %s', (_case, link, clubAppBaseUrl, expected) => {
    expect(appLinkTargetOf(link, clubAppBaseUrl)).toBe(expected);
  });
});
