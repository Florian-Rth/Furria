import { describe, expect, it } from 'vitest';
import { toGroupAdminsLabel, toGroupMembersLabel, toGroupSubline } from './group-sections';

describe('toGroupMembersLabel', () => {
  it.each([
    { count: 0, expected: 'niemand dabei' },
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
  it('names the people and the admins of one Gruppe in one line', () => {
    expect(toGroupSubline(18, 2)).toBe('18 Personen · 2 Gruppen-Admins');
  });

  it('keeps the singular on both halves', () => {
    expect(toGroupSubline(1, 1)).toBe('1 Person · 1 Gruppen-Admin');
  });

  it('says out loud when a Gruppe has no admin', () => {
    expect(toGroupSubline(18, 0)).toBe('18 Personen · kein Gruppen-Admin');
  });

  it('says out loud when nobody is in the Gruppe', () => {
    expect(toGroupSubline(0, 0)).toBe('niemand dabei · kein Gruppen-Admin');
  });
});
