import { describe, expect, it } from 'vitest';
import { kkTokens } from '../../../tokens';
import type { KkScreenActionBar } from '../../screen-declaration';
import { actionBarHeightOf } from './action-bar-height';

const { actionHeight, actionContextHeight } = kkTokens.shell;

const primary = { label: 'Speichern', onSelect: () => {} };

describe('actionBarHeightOf', () => {
  it.each<{ label: string; action: KkScreenActionBar; expected: number }>([
    { label: 'a bare primary', action: { primary }, expected: actionHeight },
    {
      label: 'a primary beside a secondary',
      action: { primary, secondary: { label: 'Verwerfen', onSelect: () => {} } },
      expected: actionHeight,
    },
    {
      label: 'a context line above the deeds',
      action: { context: '3 ausgewählt', primary },
      expected: actionHeight + actionContextHeight,
    },
    {
      label: 'an empty context line, which is still a line',
      action: { context: '', primary },
      expected: actionHeight + actionContextHeight,
    },
  ])('is $expected for $label', ({ action, expected }) => {
    expect(actionBarHeightOf(action)).toBe(expected);
  });
});
