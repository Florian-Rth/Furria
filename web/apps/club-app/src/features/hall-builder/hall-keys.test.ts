import { describe, expect, it } from 'vitest';
import { hallCommandOf } from './hall-keys';

const press = (key: string, modKey = false, shiftKey = false, inField = false) => ({
  key,
  modKey,
  shiftKey,
  inField,
});

describe('hallCommandOf', () => {
  it.each([
    { input: press('z', true), expected: { kind: 'undo' } },
    { input: press('Z', true, true), expected: { kind: 'redo' } },
    { input: press('y', true), expected: { kind: 'redo' } },
    { input: press('d', true), expected: { kind: 'duplicate' } },
    { input: press('d'), expected: { kind: 'tool', tool: 'door' } },
    { input: press('ArrowLeft'), expected: { kind: 'nudge', delta: { x: -1, y: 0 } } },
    { input: press('ArrowDown', false, true), expected: { kind: 'nudge', delta: { x: 0, y: 10 } } },
    { input: press('Backspace'), expected: { kind: 'delete' } },
    { input: press('Enter'), expected: { kind: 'finish' } },
    { input: press('Escape', false, false, true), expected: { kind: 'escape' } },
    { input: press('Backspace', false, false, true), expected: null },
    { input: press('q'), expected: null },
  ])('maps $input.key', ({ input, expected }) => {
    expect(hallCommandOf(input)).toEqual(expected);
  });
});
