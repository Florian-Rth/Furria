import { describe, expect, it } from 'vitest';
import type { AccessActions, PersonAccess } from '@/features/account-access';
import type { AppAct, AppStatus } from './person-identity';
import {
  ageOn,
  appFactOf,
  runningFeeReductionOf,
  toAppAct,
  toBirthLine,
  toPersonGaps,
} from './person-identity';

const accessOf = (overrides: Partial<PersonAccess>): PersonAccess => ({
  state: 'noAccess',
  reason: null,
  invitation: null,
  history: [],
  rights: { canInvite: true, canManageAccount: true },
  ageOfConsent: 16,
  ...overrides,
});

describe('appFactOf', () => {
  it.each<[string, PersonAccess, string | null, AppStatus, string | null]>([
    [
      'an active account since its latest arrival',
      accessOf({
        state: 'active',
        history: [
          { kind: 'invited', at: '2026-09-01T10:00:00+02:00', actor: null },
          { kind: 'redeemed', at: '2026-09-03T10:00:00+02:00', actor: null },
          { kind: 'recovered', at: '2026-10-02T10:00:00+02:00', actor: null },
        ],
      }),
      'a@b.de',
      'active',
      '2026-10-02',
    ],
    [
      'a locked account since the lock',
      accessOf({
        state: 'disabled',
        history: [{ kind: 'disabled', at: '2026-10-05T10:00:00+02:00', actor: null }],
      }),
      'a@b.de',
      'disabled',
      '2026-10-05',
    ],
    [
      'a live invitation until it expires',
      accessOf({
        state: 'invited',
        invitation: {
          channel: 'mail',
          issuedAt: '2026-10-01T10:00:00+02:00',
          issuedBy: null,
          expiresAt: '2026-10-15T10:00:00+02:00',
          isExpired: false,
        },
      }),
      'a@b.de',
      'invited',
      '2026-10-15',
    ],
    [
      'an expired invitation',
      accessOf({
        invitation: {
          channel: 'mail',
          issuedAt: '2026-09-01T10:00:00+02:00',
          issuedBy: null,
          expiresAt: '2026-09-15T10:00:00+02:00',
          isExpired: true,
        },
      }),
      'a@b.de',
      'expired',
      '2026-09-15',
    ],
    ['a missing birth date', accessOf({ reason: 'noBirthDate' }), 'a@b.de', 'noBirthDate', null],
    ['no address to mail to', accessOf({}), '  ', 'mailless', null],
    ['nobody invited yet', accessOf({}), 'a@b.de', 'none', null],
  ])('reads %s', (_case, access, email, status, on) => {
    expect(appFactOf(access, email)).toEqual({ status, on });
  });
});

describe('ageOn', () => {
  it.each([
    ['2007-05-14', '2026-05-13', 18],
    ['2007-05-14', '2026-05-14', 19],
    ['2007-05-14', '2026-12-01', 19],
  ])('counts %s on %s as %i', (birthDate, today, age) => {
    expect(ageOn(birthDate, new Date(`${today}T12:00:00`))).toBe(age);
  });
});

describe('toBirthLine', () => {
  it.each([
    ['2007-05-14', ' Großfurra ', '*14.05.2007 · 19 Jahre · Großfurra'],
    [null, 'Großfurra', 'Großfurra'],
    ['2007-05-14', null, '*14.05.2007 · 19 Jahre'],
    [null, ' ', null],
  ])('formats %s in %s', (birthDate, city, line) => {
    expect(toBirthLine(birthDate, city, new Date('2026-10-14T12:00:00'))).toBe(line);
  });
});

describe('runningFeeReductionOf', () => {
  it.each([
    [2025, 7],
    [2027, 7],
    [2028, null],
  ])('finds the reduction running in %i', (year, id) => {
    const reduction = runningFeeReductionOf(
      [{ feeReductionId: 7, basis: 'school', firstSessionYear: 2025, lastSessionYear: 2027 }],
      year,
    );

    expect(reduction?.feeReductionId ?? null).toBe(id);
  });
});

describe('toPersonGaps', () => {
  const bare = {
    feeReductions: [],
    groups: [],
    roles: [],
    unendedBoardSeats: [],
    unendedKeyHoldings: [],
  };

  it.each<[string, Partial<Parameters<typeof toPersonGaps>[0]>, string[]]>([
    ['nothing filled', {}, ['feeReductions', 'ties', 'keys']],
    [
      'a board seat as the only tie',
      {
        unendedBoardSeats: [
          { boardOfficeId: 1, name: 'Präsident', sinceOn: '2020-01-01', untilOn: null },
        ],
      },
      ['feeReductions', 'keys'],
    ],
    [
      'a key',
      {
        unendedKeyHoldings: [{ venueId: 1, name: 'Halle', sinceOn: '2020-01-01', untilOn: null }],
      },
      ['feeReductions', 'ties'],
    ],
  ])('lists the gaps of %s', (_case, filled, gaps) => {
    expect(toPersonGaps({ ...bare, ...filled })).toEqual(gaps);
  });
});

describe('toAppAct', () => {
  const quiet: AccessActions = {
    mailInvitation: null,
    inPersonInvitation: false,
    lacksMailAddress: false,
    vouchesForAge: false,
    recovery: false,
    lock: null,
    birthDateEntry: false,
  };

  it.each<[string, Partial<AccessActions>, AppAct | null]>([
    ['a missing birth date nobody may vouch for', { birthDateEntry: true }, 'birthDate'],
    [
      'a vouchable birth date gap',
      { birthDateEntry: true, vouchesForAge: true, mailInvitation: 'invite' },
      'invite',
    ],
    ['an open invitation', { mailInvitation: 'reinvite', inPersonInvitation: true }, 'reinvite'],
    ['no address to mail to', { inPersonInvitation: true, lacksMailAddress: true }, 'inPerson'],
    ['a locked account', { lock: 'enable' }, 'unlock'],
    ['a running account', { recovery: true, lock: 'disable' }, null],
  ])('offers the next step for %s', (_case, actions, act) => {
    expect(toAppAct({ ...quiet, ...actions })).toBe(act);
  });
});
