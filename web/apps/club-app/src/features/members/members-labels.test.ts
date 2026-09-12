import { describe, expect, it } from 'vitest';
import type { GroupRef, MembershipState, RoleRef } from '@/lib/api/schemas';
import {
  toConnectedSentence,
  toEmptyDescription,
  toLetterAnchorId,
  toMemberHeadline,
  toMembershipNote,
  toPersonId,
  toPersonRowAffiliation,
  toWithoutMembershipSentence,
} from './members-labels';
import type { MemberDetails } from './schemas';

const member = (overrides: Partial<MemberDetails>): MemberDetails => ({
  personId: 12,
  firstName: 'Paula',
  lastName: 'Brendel',
  membershipState: 'active',
  memberSince: '2017-09-01',
  groups: [],
  roles: [],
  contact: {
    visibility: 'hidden',
    phone: null,
    email: null,
    street: null,
    zip: null,
    city: null,
  },
  ...overrides,
});

const group = (name: string): GroupRef => ({ groupId: 1, name });
const role = (name: string): RoleRef => ({ roleId: 1, name });

describe('toPersonRowAffiliation', () => {
  it.each([
    {
      case: 'no ties at all',
      groups: [],
      roles: [],
      expected: { accent: undefined, meta: undefined },
    },
    {
      case: 'one Gruppe',
      groups: [group('Tanzgarde')],
      roles: [],
      expected: { accent: undefined, meta: 'Tanzgarde' },
    },
    {
      case: 'several Gruppen',
      groups: [group('Tanzgarde'), group('Elferrat')],
      roles: [],
      expected: { accent: undefined, meta: 'Tanzgarde · Elferrat' },
    },
    {
      case: 'one Rolle',
      groups: [],
      roles: [role('Präsidentin')],
      expected: { accent: 'Präsidentin', meta: undefined },
    },
    {
      case: 'more Rollen than fit',
      groups: [group('Elferrat')],
      roles: [role('Präsidentin'), role('Zeugwartin'), role('Chronistin')],
      expected: { accent: 'Präsidentin +2', meta: 'Elferrat' },
    },
  ])('describes $case', ({ groups, roles, expected }) => {
    expect(toPersonRowAffiliation(groups, roles)).toEqual(expected);
  });
});

describe('toLetterAnchorId', () => {
  it.each([
    ['A', 'letter-a'],
    ['Z', 'letter-z'],
    ['#', 'letter-other'],
  ])('anchors %s at %s', (letter, expected) => {
    expect(toLetterAnchorId(letter)).toBe(expected);
  });
});

describe('toConnectedSentence', () => {
  it.each([
    [1, '1 Person ist'],
    [2, '2 Personen sind'],
    [0, '0 Personen sind'],
  ])('opens the sentence for %d with %s', (count, opening) => {
    expect(toConnectedSentence(count).startsWith(opening)).toBe(true);
  });
});

describe('toWithoutMembershipSentence', () => {
  it('says nothing when everybody is a Mitglied', () => {
    expect(toWithoutMembershipSentence(0)).toBeNull();
  });

  it.each([
    [1, '1 Person tanzt'],
    [6, '6 Personen tanzen'],
  ])('opens the sentence for %d with %s', (count, opening) => {
    expect(toWithoutMembershipSentence(count)?.startsWith(opening)).toBe(true);
  });
});

describe('toEmptyDescription', () => {
  it('names the query the member typed', () => {
    expect(toEmptyDescription('  Schmidtke ')).toContain('„Schmidtke“');
  });

  it('never quotes an empty query', () => {
    expect(toEmptyDescription('   ')).not.toContain('„“');
  });
});

describe('toPersonId', () => {
  it.each<[string, number | null]>([
    ['12', 12],
    ['1', 1],
    ['0', null],
    ['-3', null],
    ['012', null],
    ['3.5', null],
    ['abc', null],
    ['', null],
    [' 7 ', null],
  ])('reads the route parameter %o as %o', (raw, expected) => {
    expect(toPersonId(raw)).toBe(expected);
  });
});

describe('toMemberHeadline', () => {
  it('titles the stage before the card is known', () => {
    expect(toMemberHeadline(undefined)).toEqual({
      title: 'Person',
      initials: '',
      state: null,
    });
  });

  it('carries name, initials and the state chip once the card is known', () => {
    const headline = toMemberHeadline(member({ membershipState: 'paused' }));

    expect(headline.title).toBe('Paula Brendel');
    expect(headline.initials).toBe('PB');
    expect(headline.state?.tone).toBe('gold');
  });
});

describe('toMembershipNote', () => {
  it('says nothing about a running membership', () => {
    expect(toMembershipNote('active', 'Paula')).toBeNull();
  });

  it.each<[MembershipState, string]>([
    ['paused', 'Ruhezeit'],
    ['ended', 'beendet'],
    ['none', 'ohne Mitglied zu sein'],
  ])('explains a %s chain by naming %s', (state, fragment) => {
    expect(toMembershipNote(state, 'Paula')).toContain(fragment);
  });

  it.each<MembershipState>(['paused', 'ended', 'none'])(
    'addresses the person by first name in the %s case',
    (state) => {
      expect(toMembershipNote(state, 'Paula')).toContain('Paula');
    },
  );
});
