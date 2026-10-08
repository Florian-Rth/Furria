import { describe, expect, it } from 'vitest';
import { toGroupPeopleNoteKind } from './group-sections';

describe('toGroupPeopleNoteKind', () => {
  it.each([
    { label: 'the group holds nobody at all', people: 0, admins: 0, expected: undefined },
    { label: 'the group has members but no admin', people: 18, admins: 0, expected: 'no-admins' },
    { label: 'an admin stands in the list', people: 18, admins: 2, expected: 'admins-first' },
  ])('is $expected when $label', ({ people, admins, expected }) => {
    expect(toGroupPeopleNoteKind(people, admins)).toBe(expected);
  });
});
