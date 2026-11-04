import { describe, expect, it } from 'vitest';
import { EMPTY_STOCK_CHOICE, memberLabValueOf, memberSearchOf } from './beer-a-lab';

describe('memberLabValueOf', () => {
  it.each([
    [{}, 'openTab'],
    [{ as: 'bigDebt' as const }, 'bigDebt'],
    [{ as: 'bigDebt' as const, stock: 'empty' as const }, EMPTY_STOCK_CHOICE],
  ])('selects the choice for %o', (search, value) => {
    expect(memberLabValueOf(search)).toBe(value);
  });
});

describe('memberSearchOf', () => {
  it('keeps the viewer when emptying the stock', () => {
    expect(memberSearchOf(EMPTY_STOCK_CHOICE, { as: 'fresh' })).toEqual({
      as: 'fresh',
      stock: 'empty',
    });
  });

  it('refills the stock when switching the viewer', () => {
    expect(memberSearchOf('former', { as: 'fresh', stock: 'empty' })).toEqual({
      as: 'former',
      stock: undefined,
    });
  });

  it('falls back to the default viewer for an unknown choice', () => {
    expect(memberSearchOf('nobody', {})).toEqual({ as: 'openTab', stock: undefined });
  });
});
