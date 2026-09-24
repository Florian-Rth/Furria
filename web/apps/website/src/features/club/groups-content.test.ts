import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import {
  buildGroupBadge,
  countRecruitingGroups,
  formatGroupCount,
  formatRecruitingCount,
  resolveGroupOpenness,
  resolveGroupsIntroKind,
  resolveGroupTint,
} from './groups-content';
import type { PublicGroup } from './schemas';

const group = (groupId: number, isRecruiting: boolean): PublicGroup => ({
  groupId,
  name: `Gruppe ${groupId}`,
  description: 'Beschreibung',
  isRecruiting,
});

describe('resolveGroupOpenness', () => {
  it('marks a recruiting group with the live dot and the gold tone', () => {
    expect(resolveGroupOpenness(true)).toMatchObject({ tone: 'gold', dot: true });
  });

  it('leaves a settled group quiet, without a dot', () => {
    expect(resolveGroupOpenness(false)).toMatchObject({ tone: 'neutral', dot: false });
  });

  it('never calls a settled group complete', () => {
    expect(resolveGroupOpenness(false).label).not.toMatch(/team/i);
  });
});

describe('countRecruitingGroups', () => {
  it('counts only the groups that are open', () => {
    expect(countRecruitingGroups([group(1, true), group(2, false), group(3, true)])).toBe(2);
  });

  it('counts nothing in an empty list', () => {
    expect(countRecruitingGroups([])).toBe(0);
  });
});

describe('resolveGroupsIntroKind', () => {
  it.each([
    { total: 6, recruiting: 0, expected: 'none' },
    { total: 1, recruiting: 1, expected: 'sole' },
    { total: 6, recruiting: 6, expected: 'all' },
    { total: 6, recruiting: 2, expected: 'some' },
  ])('reads $recruiting of $total as $expected', ({ total, recruiting, expected }) => {
    expect(resolveGroupsIntroKind(total, recruiting)).toBe(expected);
  });

  it('prefers the empty-openness reading over the single-group one', () => {
    expect(resolveGroupsIntroKind(1, 0)).toBe('none');
  });
});

describe('formatGroupCount', () => {
  it.each([
    { total: 1, expected: 'eine Gruppe' },
    { total: 2, expected: '2 Gruppen' },
    { total: 12, expected: '12 Gruppen' },
  ])('renders $total as "$expected"', ({ total, expected }) => {
    expect(formatGroupCount(total)).toBe(expected);
  });
});

describe('formatRecruitingCount', () => {
  it.each([
    { recruiting: 1, expected: 'Eine davon sucht' },
    { recruiting: 4, expected: '4 davon suchen' },
  ])('renders $recruiting as "$expected"', ({ recruiting, expected }) => {
    expect(formatRecruitingCount(recruiting)).toBe(expected);
  });
});

describe('buildGroupBadge', () => {
  it.each([
    { index: 0, expected: '01' },
    { index: 9, expected: '10' },
    { index: 99, expected: '100' },
  ])('renders position $index as "$expected"', ({ index, expected }) => {
    expect(buildGroupBadge(index)).toBe(expected);
  });
});

describe('resolveGroupTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position and wraps to any number of groups', () => {
    expect(resolveGroupTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolveGroupTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolveGroupTint(theme, 2)).toBe(theme.palette.text.primary);
    expect(resolveGroupTint(theme, 3)).toBe(resolveGroupTint(theme, 0));
  });
});
