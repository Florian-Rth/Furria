import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import type { Group } from '@/lib/seed/groups';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import type { GroupEditorial } from './groups-content';
import { buildGroupProfiles, GROUP_EDITORIAL, resolveGroupTint } from './groups-content';

const editorial: GroupEditorial = {
  blurb: 'Kurz gesagt',
  memberMeta: '11 Aktive',
  fullText: 'Ausführlich gesagt',
  lead: 'Clara Schumann',
};

const rosterEntry = (id: string, name: string): Group => ({
  id,
  name,
  ageRange: { from: 12, to: null },
  isRecruiting: true,
  tagline: 'Ergebniszeile',
});

describe('GROUP_EDITORIAL', () => {
  it('covers exactly the roster, so a renamed Gruppen-id is caught here', () => {
    expect(Object.keys(GROUP_EDITORIAL).toSorted()).toEqual(
      SEEDED_GROUPS.map((group) => group.id).toSorted(),
    );
  });
});

describe('buildGroupProfiles', () => {
  it('follows the roster order and takes the display name from the roster', () => {
    const profiles = buildGroupProfiles(
      [rosterEntry('elferrat', 'Elferrat'), rosterEntry('kindergarde', 'Kindergarde')],
      { elferrat: editorial, kindergarde: editorial },
    );

    expect(profiles.map((profile) => profile.id)).toEqual(['elferrat', 'kindergarde']);
    expect(profiles.map((profile) => profile.title)).toEqual(['Elferrat', 'Kindergarde']);
  });

  it('merges the editorial copy onto the roster entry', () => {
    const profiles = buildGroupProfiles([rosterEntry('elferrat', 'Elferrat')], {
      elferrat: editorial,
    });

    expect(profiles[0]).toEqual({ id: 'elferrat', title: 'Elferrat', ...editorial });
  });

  it('drops a Gruppe without copy instead of rendering an empty tile', () => {
    const profiles = buildGroupProfiles(
      [rosterEntry('elferrat', 'Elferrat'), rosterEntry('unbekannt', 'Unbekannt')],
      { elferrat: editorial },
    );

    expect(profiles.map((profile) => profile.id)).toEqual(['elferrat']);
  });
});

describe('resolveGroupTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position and wraps to any number of Gruppen', () => {
    expect(resolveGroupTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolveGroupTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolveGroupTint(theme, 2)).toBe(theme.palette.text.primary);
    expect(resolveGroupTint(theme, 3)).toBe(resolveGroupTint(theme, 0));
  });
});
