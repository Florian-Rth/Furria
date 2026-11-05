import { describe, expect, it } from 'vitest';
import { labelOrNull, withDoorWidth } from './hall-element-edits';

describe('withDoorWidth', () => {
  it.each([
    { from: { x: 0, y: 0 }, to: { x: 100, y: 0 }, width: 150, expected: { x: 150, y: 0 } },
    { from: { x: 10, y: 10 }, to: { x: 10, y: 90 }, width: 40, expected: { x: 10, y: 50 } },
    { from: { x: 5, y: 5 }, to: { x: 5, y: 5 }, width: 90, expected: { x: 95, y: 5 } },
  ])('keeps the start and sets the width to $width', ({ from, to, width, expected }) => {
    const door = { id: 'e1', kind: 'door' as const, from, to, door: 'entrance' as const };

    expect(withDoorWidth(door, width).to).toEqual(expected);
  });
});

describe('labelOrNull', () => {
  it.each([
    { text: 'Bühne', expected: 'Bühne' },
    { text: '   ', expected: null },
    { text: '', expected: null },
  ])('maps "$text"', ({ text, expected }) => {
    expect(labelOrNull(text)).toBe(expected);
  });
});
