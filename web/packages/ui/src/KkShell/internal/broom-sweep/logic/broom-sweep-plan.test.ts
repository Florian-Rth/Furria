import { describe, expect, it } from 'vitest';
import type { KkBarSnapshot } from '../../logic/bar-scene';
import { directionOf, ghostOf, glyphOf, planBroomSweep, shiftOf } from './broom-sweep-plan';

const home: KkBarSnapshot = {
  path: '/',
  kind: 'overview',
  lead: 'brand',
  title: 'Übersicht',
  origin: null,
};
const nested: KkBarSnapshot = {
  path: '/manage',
  kind: 'detail',
  lead: 'brand',
  title: 'Verein verwalten',
  origin: { label: 'Mehr', to: '/more' },
};
const sheet: KkBarSnapshot = {
  path: '/calendar/new',
  kind: 'fullscreen',
  lead: 'title',
  title: 'Neuer Termin',
  origin: { label: 'Kalender', to: '/calendar' },
};
const bare: KkBarSnapshot = { ...nested, lead: 'title', title: 'Heinz Hansen' };

describe('glyphOf', () => {
  it.each([
    [home, 'broom'],
    [nested, 'back'],
    [sheet, 'close'],
  ] as const)('reads the mark a bar shows', (snapshot, glyph) => {
    expect(glyphOf(snapshot)).toBe(glyph);
  });
});

describe('directionOf', () => {
  it.each([
    ['deeper', 'forward'],
    ['lateral-forward', 'forward'],
    ['still', 'forward'],
    ['shallower', 'backward'],
    ['lateral-back', 'backward'],
  ] as const)('sweeps %s moves %s', (move, direction) => {
    expect(directionOf(move)).toBe(direction);
  });
});

describe('shiftOf', () => {
  it.each([
    ['broom', 'back', 'fold'],
    ['back', 'broom', 'unfold'],
    ['broom', 'broom', 'flick'],
    ['back', 'back', 'flick'],
    ['back', 'close', 'spin'],
    ['close', 'broom', 'spin'],
  ] as const)('turns %s into %s by a %s', (from, to, shift) => {
    expect(shiftOf(from, to)).toBe(shift);
  });
});

describe('ghostOf', () => {
  it.each([
    [home, 0, { text: 'FURRIA', wordmark: true }],
    [home, 10_000, { text: 'Übersicht', wordmark: false }],
    [nested, 0, { text: 'Mehr', wordmark: false }],
    [nested, 10_000, { text: 'Verein verwalten', wordmark: false }],
    [bare, 0, { text: 'Heinz Hansen', wordmark: false }],
    [sheet, 0, { text: 'Neuer Termin', wordmark: false }],
  ] as const)('keeps the line the leaving bar showed', (previous, scrollOffset, ghost) => {
    expect(ghostOf(previous, scrollOffset, 'ramped')).toEqual(ghost);
  });
});

describe('planBroomSweep', () => {
  it('folds the broom into the back arrow on the way in', () => {
    expect(
      planBroomSweep({
        previous: home,
        current: nested,
        move: 'deeper',
        scrollOffset: 0,
        motion: 'ramped',
      }),
    ).toEqual({
      direction: 'forward',
      shift: 'fold',
      from: 'broom',
      ghost: { text: 'FURRIA', wordmark: true },
    });
  });
});
