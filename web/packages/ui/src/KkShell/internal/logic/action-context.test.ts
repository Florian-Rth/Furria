import { describe, expect, it } from 'vitest';
import type { KkScreenActionBar, KkScreenActionContext } from '../../screen-declaration';
import { actionContextOf } from './action-context';

describe('actionContextOf', () => {
  it.each<{
    context: KkScreenActionBar['context'];
    expected: KkScreenActionContext | null;
  }>([
    { context: undefined, expected: null },
    { context: '', expected: { text: '', tone: 'quiet' } },
    { context: { text: 'c', tone: 'consequence' }, expected: { text: 'c', tone: 'consequence' } },
  ])('resolves $context', ({ context, expected }) => {
    expect(actionContextOf(context)).toEqual(expected);
  });
});
