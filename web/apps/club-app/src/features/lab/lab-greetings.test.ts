import { describe, expect, it } from 'vitest';
import type { LabGreeting } from './lab-greetings';
import { labShiftOf, nextLabGreetingOf } from './lab-greetings';

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
