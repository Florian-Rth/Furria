import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import type { Group } from '@/lib/seed/groups';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import type { GroupEditorial } from './groups-content';
import {
  buildGroupProfiles,
  GROUP_EDITORIAL,
  GROUPS,
  groupsIntro,
  resolveGroupTint,
} from './groups-content';

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

describe('GROUPS', () => {
  it('seeds the P2-locked Gruppen names', () => {
    expect(GROUPS.map((group) => group.title)).toEqual(
      expect.arrayContaining(['Tanzgarde', 'Männerballett', 'Elferrat', 'Büttenrede']),
    );
  });

  it('never reintroduces the mock Spielmannszug error', () => {
    expect(GROUPS.map((group) => group.title)).not.toContain('Spielmannszug');
  });

  it('gives every Gruppe the public-facing fields the grid and modal will need', () => {
    for (const group of GROUPS) {
      expect(group.title).not.toBe('');
      expect(group.blurb).not.toBe('');
      expect(group.memberMeta).not.toBe('');
      expect(group.fullText).not.toBe('');
      expect(group.lead).not.toBe('');
    }
  });
});

describe('GROUP_EDITORIAL', () => {
  it('carries copy for every Gruppe on the roster', () => {
    for (const group of SEEDED_GROUPS) {
      expect(GROUP_EDITORIAL[group.id]).toBeDefined();
    }
  });

  it('carries copy for no Gruppe beyond the roster, so a renamed id is caught here', () => {
    const rosterIds = SEEDED_GROUPS.map((group) => group.id);

    expect(Object.keys(GROUP_EDITORIAL).toSorted()).toEqual(rosterIds.toSorted());
  });
});

describe('buildGroupProfiles', () => {
  it('follows the roster order and takes the display name from the roster', () => {
    const profiles = buildGroupProfiles(
      [rosterEntry('elferrat', 'Elferrat'), rosterEntry('kindergarde', 'Kindergarde')],
      { elferrat: editorial, kindergarde: editorial },
    );

    expect(profiles.map((profile) => profile.title)).toEqual(['Elferrat', 'Kindergarde']);
    expect(profiles.map((profile) => profile.id)).toEqual(['elferrat', 'kindergarde']);
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

describe('groupsIntro', () => {
  it('derives the count from the array so it can never drift from the grid', () => {
    expect(groupsIntro).toContain(String(GROUPS.length));
  });
});

describe('resolveGroupTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position', () => {
    expect(resolveGroupTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolveGroupTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolveGroupTint(theme, 2)).toBe(theme.palette.text.primary);
  });

  it('wraps so it scales to any number of Gruppen', () => {
    expect(resolveGroupTint(theme, 3)).toBe(resolveGroupTint(theme, 0));
    expect(resolveGroupTint(theme, GROUPS.length)).toBe(resolveGroupTint(theme, GROUPS.length % 3));
  });
});
