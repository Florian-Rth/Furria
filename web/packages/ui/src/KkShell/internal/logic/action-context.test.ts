import { describe, expect, it } from 'vitest';
import type { KkScreenActionBar, KkScreenActionContext } from '../../screen-declaration';
import { actionContextOf } from './action-context';

describe('actionContextOf', () => {
  it.each<{
    label: string;
    context: KkScreenActionBar['context'];
    expected: KkScreenActionContext | null;
  }>([
    { label: 'nothing at all', context: undefined, expected: null },
    {
      label: 'a bare string',
      context: '3 ausgewählt',
      expected: { text: '3 ausgewählt', tone: 'quiet' },
    },
    {
      label: 'an empty string, which is still a line',
      context: '',
      expected: { text: '', tone: 'quiet' },
    },
    {
      label: 'a stated consequence',
      context: { text: 'Ab 2020/21 zählt Annika nicht mehr als aktiv.', tone: 'consequence' },
      expected: { text: 'Ab 2020/21 zählt Annika nicht mehr als aktiv.', tone: 'consequence' },
    },
  ])('resolves $label', ({ context, expected }) => {
    expect(actionContextOf(context)).toEqual(expected);
  });
});
