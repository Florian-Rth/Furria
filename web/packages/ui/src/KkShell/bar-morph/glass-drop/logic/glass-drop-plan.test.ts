import { describe, expect, it } from 'vitest';
import type { KkBarMorphScene, KkBarSnapshot } from '../../../bar-morph';
import type { KkScreenMove } from '../../../screen-move';
import { glassDropPlanOf, glyphOf, motionActOf, restLineOf } from './glass-drop-plan';

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

const deeperStill: KkBarSnapshot = {
  path: '/manage/persons',
  kind: 'list',
  lead: 'title',
  title: 'Personen',
  origin: { label: 'Verein verwalten', to: '/manage' },
};

const fullscreen: KkBarSnapshot = {
  path: '/manage/persons/new',
  kind: 'fullscreen',
  lead: 'brand',
  title: 'Neue Person',
  origin: { label: 'Personen', to: '/manage/persons' },
};

describe('glyphOf', () => {
  it.each([
    [home, 'broom'],
    [nested, 'back'],
    [fullscreen, 'close'],
  ] as const)('shows the right mark', (snapshot, glyph) => {
    expect(glyphOf(snapshot)).toBe(glyph);
  });
});

describe('restLineOf', () => {
  it.each([
    [home, { kind: 'wordmark' }],
    [nested, { kind: 'text', text: 'Mehr' }],
    [deeperStill, { kind: 'text', text: 'Personen' }],
    [fullscreen, { kind: 'text', text: 'Neue Person' }],
  ] as const)('reads the line the bar rests on', (snapshot, line) => {
    expect(restLineOf(snapshot)).toEqual(line);
  });
});

const sceneOf = (
  previous: KkBarSnapshot | null,
  current: KkBarSnapshot,
  move: KkScreenMove,
): KkBarMorphScene => ({ previous, current, move });

describe('glassDropPlanOf', () => {
  it.each([
    [sceneOf(home, nested, 'deeper'), false, false, 'settled'],
    [sceneOf(null, nested, 'deeper'), true, false, 'settled'],
    [sceneOf(home, nested, 'still'), true, false, 'settled'],
    [sceneOf(home, nested, 'deeper'), true, true, 'fade'],
    [sceneOf(home, nested, 'deeper'), true, false, 'exchange'],
    [sceneOf(nested, deeperStill, 'deeper'), true, false, 'wobble'],
    [sceneOf(home, home, 'lateral-forward'), true, false, 'wave'],
    [sceneOf(deeperStill, fullscreen, 'deeper'), true, false, 'exchange'],
  ] as const)('picks the act', (scene, debut, reduced, act) => {
    expect(glassDropPlanOf({ scene, debut, reduced }).act).toBe(act);
  });

  it.each([
    ['deeper', 1],
    ['lateral-forward', 1],
    ['shallower', -1],
    ['lateral-back', -1],
  ] as const)('flows %s in direction %d', (move, direction) => {
    expect(
      glassDropPlanOf({ scene: sceneOf(home, nested, move), debut: true, reduced: false }),
    ).toMatchObject({ direction, from: 'broom', to: 'back', ghost: { kind: 'wordmark' } });
  });

  it('keeps no ghost while settled', () => {
    expect(
      glassDropPlanOf({ scene: sceneOf(home, nested, 'deeper'), debut: false, reduced: false }),
    ).toMatchObject({ from: 'back', to: 'back', ghost: null });
  });
});

describe('motionActOf', () => {
  it.each([
    ['settled', null],
    ['fade', null],
    ['exchange', 'exchange'],
    ['wave', 'wave'],
  ] as const)('keeps motion for %s', (act, motionAct) => {
    expect(motionActOf(act)).toBe(motionAct);
  });
});
