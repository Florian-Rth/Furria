import { describe, expect, it } from 'vitest';
import { sectionOriginOf } from './section-origin';

const DESTINATIONS = [
  { id: 'overview', label: 'o', icon: 'overview', activeIcon: 'home', to: '/' },
  { id: 'more', label: 'm', icon: 'more', activeIcon: 'moreFilled', to: '/more' },
] as const;

describe('sectionOriginOf', () => {
  it('leads a page back to the root of its section', () => {
    expect(
      sectionOriginOf({ section: 'more', path: '/manage', destinations: DESTINATIONS }),
    ).toEqual({ label: 'm', to: '/more' });
  });

  it.each([
    { section: 'more', path: '/more/' },
    { section: 'overview', path: '/' },
    { section: 'unknown', path: '/manage' },
  ])('offers no way back on $path in section $section', ({ section, path }) => {
    expect(sectionOriginOf({ section, path, destinations: DESTINATIONS })).toBeUndefined();
  });
});
