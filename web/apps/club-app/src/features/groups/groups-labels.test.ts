import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/lib/api/schemas';
import {
  toGroupHeadline,
  toGroupId,
  toGroupsIntroSentence,
  toMemberCountLabel,
  toPersonUnitLabel,
  toRecruitingContactLine,
  toRecruitingContactSegments,
} from './groups-labels';
import type { GroupDetails } from './schemas';

const person = (personId: number, firstName: string): PersonRef => ({
  personId,
  firstName,
  lastName: 'Kaiser',
});

const details = (overrides: Partial<GroupDetails>): GroupDetails => ({
  groupId: 3,
  name: 'Tanzgarde',
  description: 'Die Garde tanzt seit 1971.',
  isRecruiting: false,
  members: [],
  admins: [],
  ...overrides,
});

const member = (personId: number): GroupDetails['members'][number] => ({
  personId,
  firstName: 'Paula',
  lastName: 'Brendel',
  since: '2017-09-01',
});

describe('toGroupId', () => {
  it.each([
    { case: 'a positive id', raw: '3', expected: 3 },
    { case: 'a long id', raw: '1204', expected: 1204 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a negative id', raw: '-3', expected: null },
    { case: 'a word', raw: 'tanzgarde', expected: null },
    { case: 'a decimal', raw: '3.5', expected: null },
    { case: 'nothing', raw: '', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toGroupId(raw)).toBe(expected);
  });
});

describe('toMemberCountLabel', () => {
  it.each([
    { count: 0, expected: 'keine Mitglieder' },
    { count: 1, expected: '1 Person' },
    { count: 18, expected: '18 Personen' },
  ])('names $count member(s)', ({ count, expected }) => {
    expect(toMemberCountLabel(count)).toBe(expected);
  });
});

describe('toPersonUnitLabel', () => {
  it.each([
    { count: 0, expected: 'Personen' },
    { count: 1, expected: 'Person' },
    { count: 18, expected: 'Personen' },
  ])('names the unit for $count', ({ count, expected }) => {
    expect(toPersonUnitLabel(count)).toBe(expected);
  });
});

describe('toRecruitingContactSegments', () => {
  it('offers no person to click when the Gruppe has no admin', () => {
    expect(toRecruitingContactSegments([])).toEqual([
      { kind: 'text', text: 'Diese Gruppe sucht noch eine Ansprechperson.' },
    ]);
  });

  it('carries the one admin as a person segment', () => {
    expect(toRecruitingContactSegments([person(18, 'Anna')])).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('carries both admins as person segments', () => {
    expect(toRecruitingContactSegments([person(18, 'Anna'), person(19, 'Katrin')])).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna' },
      { kind: 'text', text: ' oder ' },
      { kind: 'person', personId: 19, firstName: 'Katrin' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('carries two of three and leaves the rest unlinked', () => {
    expect(
      toRecruitingContactSegments([person(18, 'Anna'), person(19, 'Katrin'), person(20, 'Jens')]),
    ).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna' },
      { kind: 'text', text: ', ' },
      { kind: 'person', personId: 19, firstName: 'Katrin' },
      { kind: 'text', text: ' oder einer der anderen Gruppen-Admins.' },
    ]);
  });
});

describe('toRecruitingContactLine', () => {
  it('asks for an Ansprechperson when the Gruppe has no admin', () => {
    expect(toRecruitingContactLine([])).toBe('Diese Gruppe sucht noch eine Ansprechperson.');
  });

  it('names the one admin', () => {
    expect(toRecruitingContactLine([person(18, 'Anna')])).toBe('Melde dich bei Anna.');
  });

  it('offers both admins', () => {
    expect(toRecruitingContactLine([person(18, 'Anna'), person(19, 'Katrin')])).toBe(
      'Melde dich bei Anna oder Katrin.',
    );
  });

  it('names two of three and points at the rest', () => {
    expect(
      toRecruitingContactLine([person(18, 'Anna'), person(19, 'Katrin'), person(20, 'Jens')]),
    ).toBe('Melde dich bei Anna, Katrin oder einer der anderen Gruppen-Admins.');
  });
});

describe('toGroupsIntroSentence', () => {
  it.each([
    { case: 'one Gruppe, none recruiting', total: 1, recruiting: 0 },
    { case: 'one Gruppe recruiting', total: 1, recruiting: 1 },
    { case: 'several Gruppen, one recruiting', total: 7, recruiting: 1 },
    { case: 'several Gruppen recruiting', total: 7, recruiting: 3 },
    { case: 'several Gruppen, none recruiting', total: 7, recruiting: 0 },
  ])('never prints a bare count as a subject for $case', ({ total, recruiting }) => {
    expect(toGroupsIntroSentence(total, recruiting)).not.toMatch(/(^|\. )1 (Gruppe|davon)/);
  });

  it('counts the Gruppen and the openings', () => {
    expect(toGroupsIntroSentence(7, 3)).toBe(
      '7 Gruppen tragen die Session. 3 davon suchen gerade Verstärkung.',
    );
  });

  it('spells the single Gruppe and the single opening as words', () => {
    expect(toGroupsIntroSentence(1, 1)).toBe(
      'Eine Gruppe trägt die Session. Eine davon sucht gerade Verstärkung.',
    );
  });

  it('says so when nobody is looking', () => {
    expect(toGroupsIntroSentence(7, 0)).toBe(
      '7 Gruppen tragen die Session. Gerade sucht keine davon Verstärkung.',
    );
  });
});

describe('toGroupHeadline', () => {
  it('falls back to the neutral title while the Gruppe is unknown', () => {
    expect(toGroupHeadline(undefined)).toEqual({
      title: 'Gruppe',
      openness: null,
      memberCount: null,
    });
  });

  it('carries the name, the openness chip and the live member count', () => {
    expect(
      toGroupHeadline(details({ isRecruiting: true, members: [member(1), member(2)] })),
    ).toEqual({
      title: 'Tanzgarde',
      openness: { label: 'sucht Verstärkung', tone: 'gold', dot: true },
      memberCount: '2 Personen · kein Gruppen-Admin',
    });
  });

  it('marks a Gruppe that is not recruiting', () => {
    expect(toGroupHeadline(details({})).openness).toEqual({
      label: 'sucht gerade niemanden',
      tone: 'neutral',
      dot: false,
    });
  });
});
