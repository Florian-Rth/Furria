import { describe, expect, it } from 'vitest';
import type { KeyDecision, KeyFocus, StudioCommand } from './studio-keys';
import { keyDecisionOf, keyHelpOf } from './studio-keys';

const free: KeyFocus = { typing: false, overlay: false, widget: false, control: false };

describe('keyDecisionOf', () => {
  it.each<[StudioCommand, Partial<KeyFocus>, boolean, KeyDecision]>([
    ['toggle', {}, false, 'run'],
    ['toggle', {}, true, 'swallow'],
    ['toggle', { control: true }, false, 'pass'],
    ['toggle', { widget: true }, false, 'run'],
    ['toggle', { typing: true }, false, 'pass'],
    ['toggle', { overlay: true }, false, 'pass'],
    ['stepBack', {}, true, 'run'],
    ['stepBack', { control: true }, false, 'run'],
    ['stepBack', { widget: true }, false, 'pass'],
    ['countForward', { overlay: true }, false, 'pass'],
    ['faster', {}, true, 'run'],
    ['loop', { widget: true }, false, 'run'],
    ['loop', {}, true, 'swallow'],
    ['zoomIn', { control: true }, true, 'run'],
    ['undo', { overlay: true }, false, 'run'],
    ['undo', { typing: true }, false, 'pass'],
    ['redo', {}, true, 'swallow'],
  ])('%s with focus %o, repeat %s → %s', (command, focus, repeat, decision) => {
    expect(keyDecisionOf(command, { ...free, ...focus }, repeat)).toBe(decision);
  });
});

describe('keyHelpOf', () => {
  it('lists the key caps of every command in a group in order', () => {
    expect(
      keyHelpOf([
        { id: 'step', commands: ['stepBack', 'stepForward'], action: 'step' },
        { id: 'zoom', commands: ['zoomIn', 'zoomOut'], action: 'zoom' },
      ]),
    ).toEqual([
      { id: 'step', keys: ['←', '→'], action: 'step' },
      { id: 'zoom', keys: ['+', '−'], action: 'zoom' },
    ]);
  });
});
