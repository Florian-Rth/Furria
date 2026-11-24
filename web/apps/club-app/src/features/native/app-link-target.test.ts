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
  ])('maps %s', (_case, link, clubAppBaseUrl, expected) => {
    expect(appLinkTargetOf(link, clubAppBaseUrl)).toBe(expected);
  });
});
