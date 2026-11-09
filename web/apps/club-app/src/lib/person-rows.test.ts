import { describe, expect, it } from 'vitest';
import { toGroupsMeta, toPersonRowAffiliation } from './person-rows';

const groupOf = (groupId: number, name: string): { groupId: number; name: string } => ({
  groupId,
  name,
});

const roleOf = (roleId: number, name: string): { roleId: number; name: string } => ({
  roleId,
  name,
});

describe('toPersonRowAffiliation', () => {
  it('leaves accent and meta out for a person without groups or roles', () => {
    expect(toPersonRowAffiliation([], [])).toEqual({ accent: undefined, meta: undefined });
  });

  it.each([
    { label: 'one role', roles: [roleOf(1, 'R1')], expected: 'R1' },
    {
      label: 'three roles',
      roles: [roleOf(1, 'R1'), roleOf(2, 'R2'), roleOf(3, 'R3')],
      expected: 'R1 +2',
    },
  ])('accents the first role and counts the further ones for $label', ({ roles, expected }) => {
    expect(toPersonRowAffiliation([], roles)).toEqual({ accent: expected, meta: undefined });
  });

  it('carries a meta once the person belongs to a group', () => {
    expect(toPersonRowAffiliation([groupOf(1, 'G1')], []).meta).toBeDefined();
  });
});

describe('toGroupsMeta', () => {
  it.each([
    { label: 'no group', groups: [], expected: undefined },
    { label: 'two groups', groups: [groupOf(1, 'G1'), groupOf(2, 'G2')], expected: 'G1 · G2' },
  ])('lists the groups for $label', ({ groups, expected }) => {
    expect(toGroupsMeta(groups)).toBe(expected);
  });
});
