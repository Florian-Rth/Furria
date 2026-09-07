import { describe, expect, it } from 'vitest';
import { MembershipStatusSchema, MembershipTypeSchema, MeSchema } from './schemas';

describe('MembershipTypeSchema', () => {
  it.each([
    [1, 'active'],
    [2, 'youth'],
    [3, 'honorary'],
  ])('reads the wire code %d as %s', (code, expected) => {
    expect(MembershipTypeSchema.parse(code)).toBe(expected);
  });

  it.each([0, 4, '1'])('refuses the unknown wire code %o', (code) => {
    expect(MembershipTypeSchema.safeParse(code).success).toBe(false);
  });
});

describe('MembershipStatusSchema', () => {
  it.each([
    [1, 'active'],
    [2, 'paused'],
    [3, 'left'],
  ])('reads the wire code %d as %s', (code, expected) => {
    expect(MembershipStatusSchema.parse(code)).toBe(expected);
  });

  it.each([0, 4, '2'])('refuses the unknown wire code %o', (code) => {
    expect(MembershipStatusSchema.safeParse(code).success).toBe(false);
  });
});

describe('MeSchema', () => {
  it('normalises the membership enums away from their wire integers', () => {
    expect(
      MeSchema.parse({
        accountId: 1,
        email: 'admin@furria.local',
        person: {
          id: 1,
          firstName: 'Furria',
          lastName: 'Admin',
          email: 'admin@furria.local',
          phone: null,
        },
        membership: { type: 2, status: 2, startedAt: '2020-11-11', endedAt: '2025-01-31' },
      }),
    ).toEqual({
      accountId: 1,
      email: 'admin@furria.local',
      person: {
        id: 1,
        firstName: 'Furria',
        lastName: 'Admin',
        email: 'admin@furria.local',
        phone: null,
      },
      membership: {
        type: 'youth',
        status: 'paused',
        startedAt: '2020-11-11',
        endedAt: '2025-01-31',
      },
    });
  });

  it('keeps an account without a membership row', () => {
    expect(
      MeSchema.parse({
        accountId: 1,
        email: 'admin@furria.local',
        person: { id: 1, firstName: 'Furria', lastName: 'Admin', email: null, phone: null },
        membership: null,
      }).membership,
    ).toBeNull();
  });

  it('drops fields the API did not promise', () => {
    expect(
      MeSchema.parse({
        accountId: 1,
        email: 'admin@furria.local',
        person: { id: 1, firstName: 'Furria', lastName: 'Admin', email: null, phone: null },
        membership: null,
        legacyRole: 'admin',
      }),
    ).not.toHaveProperty('legacyRole');
  });
});
