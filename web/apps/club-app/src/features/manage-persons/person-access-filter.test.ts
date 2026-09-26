import { describe, expect, it } from 'vitest';
import { parsePersonAccessFilter, toPersonsRequestPath } from './person-access-filter';

describe('parsePersonAccessFilter', () => {
  it.each([
    { value: 'none', expected: 'none' },
    { value: 'invited', expected: 'invited' },
    { value: 'active', expected: 'active' },
    { value: 'disabled', expected: 'disabled' },
    { value: 'not-invitable', expected: 'not-invitable' },
    { value: ' Invited ', expected: 'invited' },
    { value: 'NOT-INVITABLE', expected: 'not-invitable' },
  ])('reads "$value" as the $expected filter', ({ value, expected }) => {
    expect(parsePersonAccessFilter(value)).toBe(expected);
  });

  it.each([{ value: undefined }, { value: '' }, { value: 'everyone' }, { value: 'notInvitable' }])(
    'reads $value as no filter',
    ({ value }) => {
      expect(parsePersonAccessFilter(value)).toBeNull();
    },
  );
});

describe('toPersonsRequestPath', () => {
  it.each([
    { filter: null, expected: '/api/manage/persons' },
    { filter: 'invited' as const, expected: '/api/manage/persons?access=invited' },
    { filter: 'not-invitable' as const, expected: '/api/manage/persons?access=not-invitable' },
  ])('asks the register for $filter at $expected', ({ filter, expected }) => {
    expect(toPersonsRequestPath(filter)).toBe(expected);
  });
});
