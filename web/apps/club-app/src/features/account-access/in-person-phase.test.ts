import { describe, expect, it } from 'vitest';
import type { InPersonPhase } from './in-person-phase';
import { inPersonPhaseOf, isCodeShowing, isHandedOver } from './in-person-phase';
import type { AccessState } from './schemas';
import type { InPersonPurpose } from './types';

type PhaseInput = Parameters<typeof inPersonPhaseOf>[0];

const NOW = new Date('2026-09-26T12:00:00Z');

describe('inPersonPhaseOf', () => {
  it.each<[string, PhaseInput, InPersonPhase]>([
    [
      'the first issue on its way',
      {
        invitation: undefined,
        isIssuing: true,
        hasIssueFailed: false,
        isHandedOver: false,
        now: NOW,
      },
      { kind: 'issuing' },
    ],
    [
      'nothing issued yet',
      {
        invitation: undefined,
        isIssuing: false,
        hasIssueFailed: false,
        isHandedOver: false,
        now: NOW,
      },
      { kind: 'issuing' },
    ],
    [
      'a refused issue',
      {
        invitation: undefined,
        isIssuing: false,
        hasIssueFailed: true,
        isHandedOver: false,
        now: NOW,
      },
      { kind: 'failed' },
    ],
    [
      'a code with time left',
      {
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:15:00Z',
        },
        isIssuing: false,
        hasIssueFailed: false,
        isHandedOver: false,
        now: NOW,
      },
      {
        kind: 'showing',
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:15:00Z',
        },
        secondsLeft: 900,
      },
    ],
    [
      'a code whose time ran out',
      {
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:00:00Z',
        },
        isIssuing: false,
        hasIssueFailed: false,
        isHandedOver: false,
        now: NOW,
      },
      {
        kind: 'expired',
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:00:00Z',
        },
      },
    ],
    [
      'a new code on its way after the old one ran out',
      {
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:00:00Z',
        },
        isIssuing: true,
        hasIssueFailed: false,
        isHandedOver: false,
        now: NOW,
      },
      { kind: 'issuing' },
    ],
    [
      'her account turning active',
      {
        invitation: {
          link: 'https://club.test/invitation#token=abc',
          code: 'K7M4-Q2XP',
          expiresAt: '2026-09-26T12:15:00Z',
        },
        isIssuing: false,
        hasIssueFailed: false,
        isHandedOver: true,
        now: NOW,
      },
      { kind: 'redeemed' },
    ],
  ])('decides the phase for %s', (_case, input, expected) => {
    expect(inPersonPhaseOf(input)).toEqual(expected);
  });
});

describe('isCodeShowing', () => {
  const invitation = {
    link: 'https://club.test/invitation#token=abc',
    code: 'K7M4-Q2XP',
    expiresAt: '2026-09-26T12:15:00Z',
  };

  it.each<[string, typeof invitation | undefined, boolean, Date, boolean]>([
    ['nothing issued', undefined, false, NOW, false],
    ['a code with time left', invitation, false, NOW, true],
    ['a code being replaced', invitation, true, NOW, false],
    ['a code whose time ran out', invitation, false, new Date('2026-09-26T12:15:00Z'), false],
  ])('polls for %s', (_case, issued, isIssuing, now, expected) => {
    expect(isCodeShowing(issued, isIssuing, now)).toBe(expected);
  });
});

describe('isHandedOver', () => {
  it.each<[string, InPersonPurpose, AccessState | undefined, boolean]>([
    ['an invitation before the first poll', 'onboarding', undefined, false],
    ['an invitation still open', 'onboarding', { state: 'invited', isRecoveryOpen: false }, false],
    ['an invitation redeemed', 'onboarding', { state: 'active', isRecoveryOpen: false }, true],
    ['a recovery still open', 'recovery', { state: 'active', isRecoveryOpen: true }, false],
    ['a recovery redeemed', 'recovery', { state: 'active', isRecoveryOpen: false }, true],
    ['a recovery ended by a lock', 'recovery', { state: 'disabled', isRecoveryOpen: false }, false],
  ])('decides for %s', (_case, purpose, accessState, expected) => {
    expect(isHandedOver(purpose, accessState)).toBe(expected);
  });
});
