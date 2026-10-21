import { describe, expect, it } from 'vitest';
import type { PersonFunction } from '@/lib/api/schemas';
import type { StartMine } from '../schemas';
import { toGreetingFacts } from './greeting-facts';

const milestone = (years: number): StartMine => ({
  kind: 'milestone',
  subjectId: null,
  on: '2026-09-20',
  until: '2026-10-20',
  name: null,
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years,
  permissionKeys: null,
});

const role = (name: string): PersonFunction => ({
  kind: 'role',
  name,
  icon: 'camera',
  tone: 'iris',
});
const seat = (name: string): PersonFunction => ({
  kind: 'boardSeat',
  name,
  icon: 'crown',
  tone: null,
});

describe('toGreetingFacts', () => {
  it('shows the join year without a milestone', () => {
    expect(toGreetingFacts({ memberSince: '2015-09-01', functions: [], milestone: null })).toEqual({
      badge: null,
      facts: [{ kind: 'since', year: 2015 }],
    });
  });

  it('folds the milestone into a badge instead of the join year', () => {
    const band = toGreetingFacts({
      memberSince: '1986-09-20',
      functions: [],
      milestone: milestone(40),
    });

    expect(band.badge).toEqual({ years: 40, festive: true, joinedOn: '1986-09-20' });
    expect(band.facts).toEqual([]);
  });

  it.each([
    { years: 40, festive: true },
    { years: 22, festive: true },
    { years: 7, festive: false },
  ])('marks $years years festive: $festive', ({ years, festive }) => {
    expect(
      toGreetingFacts({ memberSince: null, functions: [], milestone: milestone(years) }).badge
        ?.festive,
    ).toBe(festive);
  });

  it('puts board seats before roles and keeps two functions', () => {
    const band = toGreetingFacts({
      memberSince: null,
      functions: [role('Fotografie'), role('Kasse'), seat('Beisitzer')],
      milestone: null,
    });

    expect(band.facts).toEqual([
      { kind: 'function', name: 'Beisitzer', glyph: 'crown' },
      { kind: 'function', name: 'Fotografie', glyph: 'camera' },
    ]);
  });
});
