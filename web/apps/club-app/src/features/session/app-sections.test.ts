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
    const persons = section({ id: 'persons', permissionKey: 'persons.manage' });

    expect(toPermittedSections([persons], ['persons.manage'])).toEqual([persons]);
  });

  it('drops a section whose permission is missing', () => {
    const persons = section({ id: 'persons', permissionKey: 'persons.manage' });

    expect(toPermittedSections([persons], ['groups.manage'])).toEqual([]);
  });

  it('drops a section that guards nothing', () => {
    expect(toPermittedSections([section({})], ['persons.manage'])).toEqual([]);
  });

  it('keeps the declared order of the managed sections', () => {
    const keys = MANAGE_SECTIONS.map((entry) => entry.permissionKey ?? '');

    expect(toPermittedSections(MANAGE_SECTIONS, keys)).toEqual(MANAGE_SECTIONS);
  });
});
