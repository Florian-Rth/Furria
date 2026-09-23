import { describe, expect, it } from 'vitest';
import { sectionOriginOf } from './section-origin';

const DESTINATIONS = [
  { id: 'overview', label: 'Übersicht', icon: 'overview', activeIcon: 'home', to: '/' },
  { id: 'more', label: 'Mehr', icon: 'more', activeIcon: 'moreFilled', to: '/more' },
] as const;

describe('sectionOriginOf', () => {
  it.each([
    { section: 'more', path: '/manage', expected: { label: 'Mehr', to: '/more' } },
    { section: 'more', path: '/manage/', expected: { label: 'Mehr', to: '/more' } },
    { section: 'overview', path: '/profile', expected: { label: 'Übersicht', to: '/' } },
  ])('leads $path back to the root of its section', ({ section, path, expected }) => {
    expect(sectionOriginOf({ section, path, destinations: DESTINATIONS })).toEqual(expected);
  });

  it.each([
    { section: 'more', path: '/more' },
    { section: 'more', path: '/more/' },
    { section: 'overview', path: '/' },
    { section: 'unknown', path: '/manage' },
    { section: undefined, path: '/manage' },
  ])('offers no way back on $path in section $section', ({ section, path }) => {
    expect(sectionOriginOf({ section, path, destinations: DESTINATIONS })).toBeUndefined();
  });
});
