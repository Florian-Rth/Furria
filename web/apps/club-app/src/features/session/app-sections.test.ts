import { describe, expect, it } from 'vitest';
import type { AppSection } from './app-sections';
import { MANAGE_SECTIONS, toPermittedSections } from './app-sections';

const section = (overrides: Partial<AppSection>): AppSection => ({
  id: 'section',
  label: 'Abschnitt',
  icon: 'settings',
  to: '/section',
  ...overrides,
});

describe('toPermittedSections', () => {
  it('keeps a section whose permission is held', () => {
    const persons = section({ id: 'persons', permissionKeys: ['persons.manage'] });

    expect(toPermittedSections([persons], ['persons.manage'])).toEqual([persons]);
  });

  it('drops a section whose permission is missing', () => {
    const persons = section({ id: 'persons', permissionKeys: ['persons.manage'] });

    expect(toPermittedSections([persons], ['groups.manage'])).toEqual([]);
  });

  it('keeps a section guarded by several permissions when only the last one is held', () => {
    const hub = section({
      id: 'hub',
      permissionKeys: ['persons.manage', 'groups.manage', 'key_holdings.manage'],
    });

    expect(toPermittedSections([hub], ['key_holdings.manage'])).toEqual([hub]);
  });

  it('drops a section that guards nothing', () => {
    expect(toPermittedSections([section({})], ['persons.manage'])).toEqual([]);
  });

  it('drops a section whose guard list is empty', () => {
    expect(toPermittedSections([section({ permissionKeys: [] })], ['persons.manage'])).toEqual([]);
  });

  it('keeps the declared order of the managed sections', () => {
    const keys = MANAGE_SECTIONS.flatMap((entry) => entry.permissionKeys ?? []);

    expect(toPermittedSections(MANAGE_SECTIONS, keys)).toEqual(MANAGE_SECTIONS);
  });
});
