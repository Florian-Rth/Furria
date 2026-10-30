import { describe, expect, it } from 'vitest';
import type { HistoryKey, HistoryKeyPress } from './studio-history-keys';
import { historyKeyOf } from './studio-history-keys';

const press = (overrides: Partial<HistoryKeyPress>): HistoryKeyPress => ({
  key: 'z',
  ctrlKey: true,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  typing: false,
  ...overrides,
});

describe('historyKeyOf', () => {
  it.each<{ name: string; press: HistoryKeyPress; key: HistoryKey | null }>([
    { name: 'Ctrl+Z', press: press({}), key: 'undo' },
    { name: 'Cmd+Z', press: press({ ctrlKey: false, metaKey: true }), key: 'undo' },
    { name: 'Ctrl+Shift+Z', press: press({ key: 'Z', shiftKey: true }), key: 'redo' },
    { name: 'Ctrl+Y', press: press({ key: 'y' }), key: 'redo' },
    { name: 'Z alone', press: press({ ctrlKey: false }), key: null },
    { name: 'Ctrl+Z while typing', press: press({ typing: true }), key: null },
    { name: 'Ctrl+Alt+Z', press: press({ altKey: true }), key: null },
    { name: 'Ctrl+S', press: press({ key: 's' }), key: null },
  ])('$name', ({ press: pressed, key }) => {
    expect(historyKeyOf(pressed)).toBe(key);
  });
});
