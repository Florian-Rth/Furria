import { describe, expect, it } from 'vitest';
import { toPeriodChip, toStateFilterOptions, toStateStats, toSwitchStateChip } from './state-chips';

describe('toStateFilterOptions', () => {
  it('offers every occurring state in the club order, with the total first', () => {
    expect(toStateFilterOptions({ active: 134, paused: 12, ended: 4, none: 6 })).toEqual([
      { id: 'all', label: 'Alle', count: 156 },
      { id: 'active', label: 'aktiv', count: 134 },
      { id: 'paused', label: 'ruht', count: 12 },
      { id: 'ended', label: 'beendet', count: 4 },
      { id: 'none', label: 'kein Mitglied', count: 6 },
    ]);
  });

  it('drops the states that nobody is in', () => {
    expect(
      toStateFilterOptions({ active: 0, paused: 0, ended: 0, none: 1 }).map((option) => option.id),
    ).toEqual(['all', 'none']);
  });

  it('counts nobody as a total of zero', () => {
    expect(toStateFilterOptions({ active: 0, paused: 0, ended: 0, none: 0 })).toEqual([
      { id: 'all', label: 'Alle', count: 0 },
    ]);
  });
});

describe('toPeriodChip', () => {
  it.each([
    { label: 'a running period', isRunning: true, isFuture: false, expected: 'läuft' },
    { label: 'a period that has not begun', isRunning: false, isFuture: true, expected: 'geplant' },
    { label: 'a closed period', isRunning: false, isFuture: false, expected: null },
  ])('marks $label', ({ isRunning, isFuture, expected }) => {
    expect(toPeriodChip(isRunning, isFuture)?.label ?? null).toBe(expected);
  });

  it('gives the running chip a live dot and the planned chip none', () => {
    expect(toPeriodChip(true, false)).toEqual({ label: 'läuft', tone: 'green', dot: true });
    expect(toPeriodChip(false, true)).toEqual({ label: 'geplant', tone: 'neutral', dot: false });
  });
});

describe('toStateStats', () => {
  it('counts every state that occurs, in the club order, accenting only aktiv', () => {
    expect(toStateStats({ active: 113, paused: 6, ended: 2, none: 11 })).toEqual([
      { state: 'active', label: 'aktiv', count: 113, tone: 'accent' },
      { state: 'paused', label: 'ruht', count: 6, tone: 'default' },
      { state: 'ended', label: 'beendet', count: 2, tone: 'default' },
      { state: 'none', label: 'kein Mitglied', count: 11, tone: 'default' },
    ]);
  });

  it('drops the states nobody is in, so three values remain when three occur', () => {
    expect(
      toStateStats({ active: 113, paused: 0, ended: 14, none: 18 }).map((s) => s.state),
    ).toEqual(['active', 'ended', 'none']);
  });

  it('sums to the same total the filter chips offer', () => {
    const counts = { active: 113, paused: 6, ended: 2, none: 11 };
    const statsTotal = toStateStats(counts).reduce((sum, stat) => sum + stat.count, 0);

    expect(statsTotal).toBe(toStateFilterOptions(counts)[0]?.count);
  });
});

describe('toSwitchStateChip', () => {
  it.each([
    { checked: true, label: 'an', tone: 'green' },
    { checked: false, label: 'aus', tone: 'neutral' },
  ])('paints the $label state without a dot', ({ checked, label, tone }) => {
    expect(toSwitchStateChip(checked)).toEqual({ label, tone, dot: false });
  });
});
