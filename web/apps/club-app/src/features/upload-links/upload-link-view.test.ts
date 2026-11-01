import { describe, expect, it } from 'vitest';
import type { UploadLink } from './schemas';
import type { LinkLookupStatus } from './upload-link-view';
import {
  linkPageStageOf,
  linkSectionsOf,
  remainingOf,
  shareOriginOf,
  shareUrlOf,
  tokenOfHash,
} from './upload-link-view';

const TOKEN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJK_-0123';

const link = (
  uploadLinkId: number,
  state: UploadLink['state'],
  createdAt: string,
  expiresAt: string,
): UploadLink => ({
  uploadLinkId,
  title: `Link ${uploadLinkId}`,
  state,
  token: state === 'open' ? TOKEN : null,
  createdAt,
  expiresAt,
  revokedAt: null,
  createdBy: null,
  uploadCount: 0,
  inboxPhotos: 0,
  inboxVideos: 0,
});

describe('tokenOfHash', () => {
  it.each([
    { label: 'a token behind the hash sign', hash: `#${TOKEN}`, expected: TOKEN },
    { label: 'a token without the hash sign', hash: TOKEN, expected: TOKEN },
    { label: 'an empty hash', hash: '', expected: null },
    { label: 'a cut-off token', hash: `#${TOKEN.slice(0, 20)}`, expected: null },
    { label: 'a token with foreign characters', hash: `#${TOKEN.slice(0, 42)}!`, expected: null },
  ])('reads $label', ({ hash, expected }) => {
    expect(tokenOfHash(hash)).toBe(expected);
  });
});

describe('shareOriginOf', () => {
  it.each([
    {
      label: 'the page itself when the app talks to its own origin',
      apiBaseUrl: '',
      expected: 'https://app.example.org',
    },
    {
      label: 'the club app host when the native shell talks to it',
      apiBaseUrl: 'https://app.example.org/',
      expected: 'https://app.example.org',
    },
  ])('points at $label', ({ apiBaseUrl, expected }) => {
    expect(shareOriginOf(apiBaseUrl, 'https://app.example.org')).toBe(expected);
  });
});

describe('shareUrlOf', () => {
  it('keeps the token in the fragment so no server sees it', () => {
    expect(shareUrlOf('https://app.example.org', TOKEN)).toBe(
      `https://app.example.org/photos#${TOKEN}`,
    );
  });
});

describe('linkPageStageOf', () => {
  const waiting: LinkLookupStatus = {
    state: null,
    failedStatus: null,
    failed: false,
  };

  it.each<{ label: string; token: string | null; lookup: LinkLookupStatus; stage: string }>([
    { label: 'no token in the address', token: null, lookup: waiting, stage: 'missing' },
    { label: 'a lookup under way', token: TOKEN, lookup: waiting, stage: 'checking' },
    {
      label: 'an open link',
      token: TOKEN,
      lookup: { ...waiting, state: 'open' },
      stage: 'open',
    },
    {
      label: 'an expired link',
      token: TOKEN,
      lookup: { ...waiting, state: 'expired' },
      stage: 'expired',
    },
    {
      label: 'an ended link',
      token: TOKEN,
      lookup: { ...waiting, state: 'revoked' },
      stage: 'revoked',
    },
    {
      label: 'a token the club never handed out',
      token: TOKEN,
      lookup: { ...waiting, failed: true, failedStatus: 404 },
      stage: 'unknown',
    },
    {
      label: 'an unreachable server',
      token: TOKEN,
      lookup: { ...waiting, failed: true, failedStatus: null },
      stage: 'failed',
    },
  ])('shows $label as $stage', ({ token, lookup, stage }) => {
    expect(linkPageStageOf(token, lookup)).toBe(stage);
  });
});

describe('remainingOf', () => {
  const now = new Date('2026-11-01T12:00:00Z');

  it.each([
    {
      label: 'a full week',
      expiresAt: '2026-11-08T12:00:00Z',
      expected: { unit: 'days', count: 7 },
    },
    {
      label: 'a day and a bit',
      expiresAt: '2026-11-02T13:00:00Z',
      expected: { unit: 'days', count: 2 },
    },
    {
      label: 'the last hours',
      expiresAt: '2026-11-01T17:30:00Z',
      expected: { unit: 'hours', count: 6 },
    },
    { label: 'a passed end', expiresAt: '2026-11-01T11:59:00Z', expected: { unit: 'over' } },
  ])('counts $label', ({ expiresAt, expected }) => {
    expect(remainingOf(expiresAt, now)).toEqual(expected);
  });
});

describe('linkSectionsOf', () => {
  it('puts open links first by their end and ended links newest first', () => {
    const sections = linkSectionsOf([
      link(1, 'expired', '2026-10-01T10:00:00Z', '2026-10-08T10:00:00Z'),
      link(2, 'open', '2026-10-30T10:00:00Z', '2026-11-06T10:00:00Z'),
      link(3, 'revoked', '2026-10-20T10:00:00Z', '2026-10-27T10:00:00Z'),
      link(4, 'open', '2026-10-28T10:00:00Z', '2026-11-04T10:00:00Z'),
    ]);

    expect({
      open: sections.open.map((entry) => entry.uploadLinkId),
      ended: sections.ended.map((entry) => entry.uploadLinkId),
    }).toEqual({ open: [4, 2], ended: [3, 1] });
  });
});
