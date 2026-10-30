import { describe, expect, it } from 'vitest';
import type { LoopKind } from '@/features/act-practice/practice-controls';
import { wayLoopKeyOf } from './way-loop';

describe('wayLoopKeyOf', () => {
  it.each<[LoopKind, string, boolean]>([
    ['off', 'loopStep', false],
    ['step', 'loopStep', true],
    ['part', 'loopPart', true],
  ])('while the loop is %s the key repeats %s, pressed %s', (kind, press, pressed) => {
    const key = wayLoopKeyOf(kind);

    expect([key.press, key.pressed]).toEqual([press, pressed]);
  });
});
