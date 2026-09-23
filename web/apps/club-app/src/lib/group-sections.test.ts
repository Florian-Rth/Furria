import { describe, expect, it } from 'vitest';
import {
  GROUP_PEOPLE_NOTE,
  NO_ADMINS_LINE,
  toGroupAdminsLabel,
  toGroupMembersLabel,
  toGroupPeopleNote,
  toGroupSubline,
} from './group-sections';

describe('toGroupMembersLabel', () => {
  it.each([
    { count: 0, expected: 'keine Mitglieder' },
    { count: 1, expected: '1 Person' },
    { count: 2, expected: '2 Personen' },
    { count: 18, expected: '18 Personen' },
  ])('says $expected for $count', ({ count, expected }) => {
    expect(toGroupMembersLabel(count)).toBe(expected);
  });
});

describe('toGroupAdminsLabel', () => {
  it.each([
    { count: 0, expected: 'kein Gruppen-Admin' },
    { count: 1, expected: '1 Gruppen-Admin' },
    { count: 2, expected: '2 Gruppen-Admins' },
    { count: 3, expected: '3 Gruppen-Admins' },
  ])('says $expected for $count', ({ count, expected }) => {
    expect(toGroupAdminsLabel(count)).toBe(expected);
  });
});

describe('toGroupSubline', () => {
  it('names the people and the admins of one group in one line', () => {
    expect(toGroupSubline(18, 2)).toBe('18 Personen · 2 Gruppen-Admins');
  });

  it('keeps the singular on both halves', () => {
    expect(toGroupSubline(1, 1)).toBe('1 Person · 1 Gruppen-Admin');
  });

  it('says out loud when a group has no admin', () => {
    expect(toGroupSubline(18, 0)).toBe('18 Personen · kein Gruppen-Admin');
  });

  it('says out loud when nobody is in the group', () => {
    expect(toGroupSubline(0, 0)).toBe('keine Mitglieder · kein Gruppen-Admin');
  });
});

describe('toGroupPeopleNote', () => {
  it('stays quiet while the group holds nobody at all', () => {
    expect(toGroupPeopleNote(0, 0)).toBeUndefined();
  });

  it('warns that nobody maintains the group while it has members but no admin', () => {
    expect(toGroupPeopleNote(18, 0)).toBe(NO_ADMINS_LINE);
  });

  it('explains the order of the list once an Admin stands in it', () => {
    expect(toGroupPeopleNote(18, 2)).toBe(GROUP_PEOPLE_NOTE);
  });
});
