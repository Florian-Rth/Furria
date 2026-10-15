import { describe, expect, it } from 'vitest';
import type { RoleCoinForm } from './role-coin';
import { toRoleCoin, toShownCoin } from './role-coin';

describe('toRoleCoin', () => {
  it.each<[string, RoleCoinForm, boolean]>([
    [
      'switched on with icon and tone',
      { showsCoin: true, coinIcon: 'drum', coinTone: 'rose' },
      true,
    ],
    [
      'switched off despite a kept pick',
      { showsCoin: false, coinIcon: 'drum', coinTone: 'rose' },
      false,
    ],
    ['switched on without a tone', { showsCoin: true, coinIcon: 'drum', coinTone: null }, false],
    ['switched on without an icon', { showsCoin: true, coinIcon: null, coinTone: 'rose' }, false],
  ])('%s', (_case, form, coined) => {
    expect(toRoleCoin(form) !== null).toBe(coined);
  });

  it('carries the picked icon and tone', () => {
    expect(toRoleCoin({ showsCoin: true, coinIcon: 'drum', coinTone: 'rose' })).toEqual({
      icon: 'drum',
      tone: 'rose',
    });
  });
});

describe('toShownCoin', () => {
  it('keeps an earlier pick when the coin is switched on again', () => {
    expect(toShownCoin('mic', 'iris')).toEqual({ icon: 'mic', tone: 'iris' });
  });

  it('fills a missing pick so the coin is complete at once', () => {
    const coin = toShownCoin(null, 'iris');

    expect(coin.tone).toBe('iris');
    expect(coin.icon).not.toBeNull();
  });
});
