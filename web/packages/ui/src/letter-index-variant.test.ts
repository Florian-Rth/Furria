import { describe, expect, it } from 'vitest';
import type { KkLetterIndexVariant } from './letter-index-variant';
import { toLetterIndexBehaviour } from './letter-index-variant';

describe('toLetterIndexBehaviour', () => {
  it.each([
    { variant: 'grid', scrolls: false, fixed: false },
    { variant: 'strip', scrolls: true, fixed: false },
    { variant: 'rail', scrolls: false, fixed: true },
  ] satisfies readonly { variant: KkLetterIndexVariant; scrolls: boolean; fixed: boolean }[])(
    'reads $variant as scrolls=$scrolls fixed=$fixed',
    ({ variant, scrolls, fixed }) => {
      expect(toLetterIndexBehaviour(variant)).toEqual({ scrolls, fixed });
    },
  );
});
