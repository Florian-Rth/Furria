import { describe, expect, it } from 'vitest';
import type { LaneKeyPress } from './lane-keys';
import { laneKeyOf } from './lane-keys';

const press = (overrides: Partial<LaneKeyPress>): LaneKeyPress => ({
  key: ' ',
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  typing: false,
  onControl: false,
  ...overrides,
});

describe('laneKeyOf', () => {
  it.each([
    [press({}), 'toggle'],
    [press({ onControl: true }), null],
    [press({ key: 'ArrowLeft' }), 'stepBack'],
    [press({ key: 'ArrowRight' }), 'stepForward'],
    [press({ key: 'ArrowLeft', shiftKey: true }), 'countBack'],
    [press({ key: 'ArrowRight', shiftKey: true }), 'countForward'],
    [press({ key: '+' }), 'zoomIn'],
    [press({ key: '=', shiftKey: true }), 'zoomIn'],
    [press({ key: '-' }), 'zoomOut'],
    [press({ key: 'z', ctrlKey: true }), null],
    [press({ key: 'ArrowLeft', typing: true }), null],
    [press({ key: 'ArrowRight', metaKey: true }), null],
    [press({ key: 'x' }), null],
  ])('maps %o', (input, expected) => {
    expect(laneKeyOf(input)).toBe(expected);
  });
});
