import { describe, expect, it } from 'vitest';
import type { GroupRef, RoleRef } from '@/lib/api/schemas';
import {
  toConnectedSentence,
  toEmptyDescription,
  toLetterAnchorId,
  toPersonRowAffiliation,
  toWithoutMembershipSentence,
} from './members-labels';

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
