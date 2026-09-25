import { describe, expect, it } from 'vitest';
import {
  findMembershipOfPause,
  isContactWithheld,
  splitPersonGroups,
  toEndMembershipConsequence,
  toFeeReductionConsequence,
  toMembershipConsequence,
  toOpenPause,
  toPauseConsequence,
  toPersonHeadline,
  toPersonId,
  toPersonRowAffiliation,
  toPersonsEmptyDescription,
} from './manage-persons-labels';
import type { PersonDetails, PersonMembership, PersonSummary } from './schemas';

const person = (overrides: Partial<PersonSummary> & { personId: number }): PersonSummary => ({
  firstName: 'Anna',
  lastName: 'Adam',
  email: null,
  phone: null,
  street: null,
  zip: null,
  city: null,
  birthDate: null,
  contactVisibleToMembers: false,
  membershipState: 'active',
  memberSince: null,
  groups: [],
  roles: [],
  ...overrides,
});

const membership = (overrides: Partial<PersonMembership>): PersonMembership => ({
  membershipId: 1,
  startedOn: '2018-03-01',
  endedOn: null,
  isRunning: true,
  isFuture: false,
  pauses: [],
  ...overrides,
});

describe('toPersonId', () => {
  it.each([
    { raw: '7', expected: 7 },
    { raw: '0', expected: null },
    { raw: '07', expected: null },
    { raw: '-3', expected: null },
    { raw: 'sieben', expected: null },
    { raw: '', expected: null },
  ])('reads $raw as $expected', ({ raw, expected }) => {
    expect(toPersonId(raw)).toBe(expected);
  });
});

describe('isContactWithheld', () => {
  it.each([
    { label: 'nothing on record', row: {}, expected: false },
    { label: 'a phone kept private', row: { phone: '0170 1234' }, expected: true },
    {
      label: 'a phone opted in',
      row: { phone: '0170 1234', contactVisibleToMembers: true },
      expected: false,
    },
    { label: 'an address kept private', row: { zip: '99713', city: 'Großfurra' }, expected: true },
    { label: 'a blank address', row: { street: '   ' }, expected: false },
  ])('answers $expected for $label', ({ row, expected }) => {
    expect(isContactWithheld(person({ personId: 1, ...row }))).toBe(expected);
  });
});

describe('toPersonRowAffiliation', () => {
  it('names one role in full and counts the rest', () => {
    const affiliation = toPersonRowAffiliation(
      person({
        personId: 1,
        roles: [
          { roleId: 1, name: 'Präsidentin' },
          { roleId: 2, name: 'Chronistin' },
        ],
        groups: [
          { groupId: 1, name: 'Große Garde' },
          { groupId: 2, name: 'Elferrat' },
        ],
      }),
    );

    expect(affiliation).toEqual({
      accent: 'Präsidentin +1',
      meta: 'Große Garde · Elferrat',
    });
  });

  it('leaves both slots undefined for an unaffiliated Person', () => {
    expect(toPersonRowAffiliation(person({ personId: 1 }))).toEqual({
      accent: undefined,
      meta: undefined,
    });
  });
});

describe('toPersonsEmptyDescription', () => {
  it('quotes the query that found nobody', () => {
    expect(toPersonsEmptyDescription('  Kühn ', 'all')).toContain('„Kühn“');
  });

  it('leaves the filter out of it while a query is running', () => {
    expect(toPersonsEmptyDescription('Kühn', 'paused')).not.toContain('Alle');
  });

  it('offers the „Alle“ filter when a state filter hides everyone', () => {
    expect(toPersonsEmptyDescription('', 'paused')).toContain('Alle');
  });

  it('suggests nothing when „Alle“ is already the chosen filter', () => {
    expect(toPersonsEmptyDescription('', 'all')).not.toContain('Alle');
  });
});

describe('toPersonHeadline', () => {
  it('falls back while the payload is still loading', () => {
    expect(toPersonHeadline(undefined)).toEqual({
      title: 'Person',
      initials: '',
      state: null,
    });
  });

  it('chips a membership that has not begun as „kein Mitglied“', () => {
    const headline = toPersonHeadline({
      personId: 5,
      firstName: 'Dorothea',
      lastName: 'Oehler',
      email: null,
      phone: null,
      street: null,
      zip: null,
      city: null,
      birthDate: null,
      contactVisibleToMembers: false,
      membershipState: 'none',
      memberSince: null,
      memberships: [],
      feeReductions: [],
      groups: [],
      roles: [],
      access: { state: 'noAccess', reason: 'noEmail', invitation: null, history: [] },
    });

    expect(headline).toEqual({
      title: 'Dorothea Oehler',
      initials: 'DO',
      state: { label: 'kein Mitglied', tone: 'neutral', dot: false },
    });
  });
});

describe('toOpenPause', () => {
  it('finds the one pause without an end', () => {
    const open = toOpenPause(
      membership({
        pauses: [
          { pauseId: 1, firstSessionYear: 2012, lastSessionYear: 2013 },
          { pauseId: 2, firstSessionYear: 2024, lastSessionYear: null },
        ],
      }),
    );

    expect(open?.pauseId).toBe(2);
  });

  it('answers null when every pause is closed', () => {
    expect(
      toOpenPause(
        membership({ pauses: [{ pauseId: 1, firstSessionYear: 2012, lastSessionYear: 2013 }] }),
      ),
    ).toBeNull();
  });
});

describe('toMembershipConsequence', () => {
  it.each([
    {
      label: 'a closed period',
      startedOn: '2009-01-11',
      endedOn: '2016-02-10',
      expected: 'Die Mitgliedschaft gilt vom 11.01.2009 bis zum 10.02.2016.',
    },
    {
      label: 'a future start',
      startedOn: '2026-10-27',
      endedOn: null,
      expected: 'Die Mitgliedschaft beginnt am 27.10.2026.',
    },
    {
      label: 'a running period',
      startedOn: '2018-03-01',
      endedOn: null,
      expected: 'Die Mitgliedschaft besteht seit dem 01.03.2018 und ist unbefristet.',
    },
  ])('describes $label', ({ startedOn, endedOn, expected }) => {
    expect(toMembershipConsequence(startedOn, endedOn, '2026-09-12')).toContain(expected);
  });
});

describe('toPauseConsequence', () => {
  it('says the pause has no end yet when it is open', () => {
    expect(toPauseConsequence('Nicole', 2025, null)).toContain(
      'ab Session 2025/26 bis auf Weiteres',
    );
  });

  it('names the span when both ends are known', () => {
    expect(toPauseConsequence('Anna', 2012, 2013)).toContain('in 2012/13 – 2013/14');
  });
});

describe('toFeeReductionConsequence', () => {
  it('names the German basis and the Session span', () => {
    expect(toFeeReductionConsequence('studies', 2024, 2026)).toContain(
      'Studium gilt für 2024/25 – 2026/27',
    );
  });

  it('collapses a one-Session span', () => {
    expect(toFeeReductionConsequence('school', 2025, 2025)).toContain('Schule gilt für 2025/26.');
  });
});

describe('toEndMembershipConsequence', () => {
  it('adds the clamp sentence only when a pause is open', () => {
    expect(toEndMembershipConsequence('Nicole', '2026-02-18', true)).toContain(
      'Eine offene Ruhezeit endet mit der Mitgliedschaft.',
    );
    expect(toEndMembershipConsequence('Anna', '2026-02-18', false)).not.toContain('Ruhezeit');
  });
});

describe('splitPersonGroups', () => {
  it('keeps the running rows apart from the closed ones', () => {
    const split = splitPersonGroups([
      { groupId: 1, name: 'Große Garde', joinedOn: '2018-03-01', leftOn: null },
      { groupId: 2, name: 'Elferrat', joinedOn: '2012-01-01', leftOn: '2014-02-01' },
    ]);

    expect(split.running.map((row) => row.groupId)).toEqual([1]);
    expect(split.past.map((row) => row.groupId)).toEqual([2]);
  });
});

const personDetails = (
  overrides: Partial<PersonDetails> & { personId: number },
): PersonDetails => ({
  firstName: 'Anna',
  lastName: 'Adam',
  email: null,
  phone: null,
  street: null,
  zip: null,
  city: null,
  birthDate: null,
  contactVisibleToMembers: false,
  membershipState: 'active',
  memberSince: null,
  memberships: [],
  feeReductions: [],
  groups: [],
  roles: [],
  access: { state: 'noAccess', reason: 'noEmail', invitation: null, history: [] },
  ...overrides,
});

describe('findMembershipOfPause', () => {
  it('finds the membership owning a given pause across several periods', () => {
    const found = findMembershipOfPause(
      personDetails({
        personId: 1,
        memberships: [
          membership({ membershipId: 1, pauses: [] }),
          membership({
            membershipId: 2,
            pauses: [{ pauseId: 9, firstSessionYear: 2020, lastSessionYear: null }],
          }),
        ],
      }),
      9,
    );

    expect(found?.membership.membershipId).toBe(2);
    expect(found?.pause.pauseId).toBe(9);
  });

  it('answers null when no membership holds that pause', () => {
    expect(
      findMembershipOfPause(personDetails({ personId: 1, memberships: [membership({})] }), 9),
    ).toBeNull();
  });
});
