import { describe, expect, it } from 'vitest';
import { isChangedBlock } from './rich-text-blocks';

describe('isChangedBlock', () => {
  const live = new Set(['Erster Absatz.', '## Zwischentitel']);

  it.each([
    { block: 'Erster Absatz.', changed: false },
    { block: '  Erster Absatz.  ', changed: false },
    { block: 'Erster Absatz, neu.', changed: true },
    { block: '', changed: false },
    { block: '   ', changed: false },
  ])('treats "$block" as changed: $changed', ({ block, changed }) => {
    expect(isChangedBlock(block, live)).toBe(changed);
  });
});
