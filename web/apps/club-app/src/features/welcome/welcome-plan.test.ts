import { describe, expect, it } from 'vitest';
import type { Me } from '@/lib/api/schemas';
import { owedWelcomeOf, welcomePlanOf } from './welcome-plan';

const SWEEP_MS = 720;

describe('welcomePlanOf', () => {
  it.each([
    {
      memberSince: '1974-11-11',
      joining: { kind: 'since', year: 1974 },
      reel: [1971, 1972, 1973, 1974],
    },
    { memberSince: '1971-11-11', joining: { kind: 'founding' }, reel: [1971] },
    { memberSince: '1968-01-01', joining: { kind: 'founding' }, reel: [1971] },
    { memberSince: null, joining: { kind: 'now' }, reel: [1971] },
  ])('rolls the year reel up to her joining for $memberSince', ({ memberSince, joining, reel }) => {
    const plan = welcomePlanOf(
      { firstName: 'Lena', memberSince, sessionOrdinal: null, functions: [] },
      SWEEP_MS,
    );

    expect({ joining: plan.joining, reel: plan.reelYears }).toEqual({ joining, reel });
  });

  it('bills her session first, then at most two functions with board seats ahead of roles', () => {
    const plan = welcomePlanOf(
      {
        firstName: 'Lena',
        memberSince: '2014-03-01',
        sessionOrdinal: 13,
        functions: [
          { kind: 'groupAdmin', name: 'Tanzgarde', icon: null, tone: null },
          { kind: 'role', name: 'Trainerin', icon: null, tone: null },
          { kind: 'boardSeat', name: 'Kassenprüferin', icon: null, tone: null },
        ],
      },
      SWEEP_MS,
    );

    expect(plan.lines).toEqual([
      { kind: 'session', ordinal: 13 },
      { kind: 'function', name: 'Kassenprüferin' },
      { kind: 'function', name: 'Trainerin' },
    ]);
  });

  it('times every beat after the one before', () => {
    const { beats } = welcomePlanOf(
      { firstName: 'Lena', memberSince: '2014-03-01', sessionOrdinal: 13, functions: [] },
      SWEEP_MS,
    );

    expect(beats).toEqual({
      dateline: 250,
      reel: 600,
      reelMs: 1980,
      founded: 800,
      joined: 2730,
      name: 3380,
      letterMs: 65,
      lines: [4340],
      sweep: 5240,
      call: 5636,
      answer: 6116,
      enter: 6816,
    });
  });

  it('sweeps right after her name when nothing else is billed', () => {
    const { beats } = welcomePlanOf(
      { firstName: 'Jo', memberSince: null, sessionOrdinal: null, functions: [] },
      SWEEP_MS,
    );

    expect({ reelMs: beats.reelMs, lines: beats.lines, sweep: beats.sweep }).toEqual({
      reelMs: 0,
      lines: [],
      sweep: 2530,
    });
  });
});

const ME: Me = {
  accountId: 1,
  email: 'lena@example.org',
  person: {
    id: 4,
    firstName: 'Lena',
    lastName: 'Muster',
    email: null,
    phone: null,
    street: null,
    zip: null,
    city: null,
    birthDate: null,
    contactVisibleToMembers: false,
    contactChange: null,
    portrait: null,
  },
  membership: {
    state: 'active',
    memberSince: '2014-03-01',
    currentStartedOn: '2014-03-01',
    currentEndedOn: null,
    relevantSession: { startYear: 2026, ordinal: 13 },
  },
  isAffiliated: true,
  permissionKeys: [],
  lastSeenAnnouncementAt: null,
  welcomeSeenAt: null,
  appSince: null,
  passkeys: [],
  honours: { sessions: 12, functions: [] },
};

describe('owedWelcomeOf', () => {
  it.each([
    { name: 'a person who never saw it', me: ME, owed: true },
    {
      name: 'a person who saw it',
      me: { ...ME, welcomeSeenAt: '2026-11-11T10:11:00Z' },
      owed: false,
    },
    { name: 'a managing login', me: { ...ME, person: null }, owed: false },
  ])('owes the welcome to $name: $owed', ({ me, owed }) => {
    expect(owedWelcomeOf(me) !== null).toBe(owed);
  });
});
