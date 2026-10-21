import { describe, expect, it } from 'vitest';
import type { LabGreeting } from './lab-greetings';
import { labMilestoneOf, labShiftOf, nextLabGreetingOf } from './lab-greetings';

const greetingOf = (slug: string): LabGreeting => ({
  slug,
  bank: 'season',
  title: slug,
  at: '2027-01-19T09:30',
  viewer: {
    birthDate: null,
    membershipState: 'active',
    memberSince: null,
    relevantSession: null,
    appSince: null,
  },
  firstName: 'Lena',
  holder: { initials: 'LB', image: null, honours: { sessions: 0, functions: [] } },
  still: false,
});

describe('nextLabGreetingOf', () => {
  const greetings = [greetingOf('a'), greetingOf('b'), greetingOf('c')];

  it.each([
    { slug: 'a', next: 'b' },
    { slug: 'c', next: 'a' },
    { slug: 'unknown', next: 'a' },
  ])('follows $slug with $next', ({ slug, next }) => {
    expect(nextLabGreetingOf(greetings, slug)?.slug).toBe(next);
  });

  it('finds nothing in an empty lab', () => {
    expect(nextLabGreetingOf([], 'a')).toBeNull();
  });
});

describe('labShiftOf', () => {
  it('shifts the clock from now to the greeting moment', () => {
    expect(labShiftOf('2026-11-11T11:10:52', new Date('2026-11-11T11:10:50').getTime())).toBe(2000);
  });
});

describe('labMilestoneOf', () => {
  const anniversary = (years: number) =>
    ({
      moment: 'joinAnniversary',
      years,
      clause: { kind: 'sessionDay', day: 70 },
      festive: false,
      key: 'joinAnniversary:2027-01-19',
      sessionYear: 2026,
      ordinal: 12,
      lapClose: null,
    }) as const;

  it.each([
    { years: 11, round: true },
    { years: 10, round: true },
    { years: 3, round: false },
  ])('badges a $years-year anniversary: $round', ({ years, round }) => {
    expect(labMilestoneOf(anniversary(years), '2027-01-19T09:30')?.years ?? null).toBe(
      round ? years : null,
    );
  });

  it('badges nothing on other days', () => {
    expect(
      labMilestoneOf(
        {
          moment: 'daily',
          clause: { kind: 'sessionDay', day: 70 },
          festive: false,
          key: 'daily:2027-01-19',
          sessionYear: 2026,
          ordinal: 12,
          lapClose: null,
        },
        '2027-01-19T09:30',
      ),
    ).toBeNull();
  });
});
