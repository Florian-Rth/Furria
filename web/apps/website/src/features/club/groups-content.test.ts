import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { GROUPS, groupsIntro, resolveGroupTint } from './groups-content';

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
      expect(group.schedule).not.toBe('');
    }
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
