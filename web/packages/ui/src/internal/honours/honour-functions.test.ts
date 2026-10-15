import { describe, expect, it } from 'vitest';
import { honourCoinsOf, honourDisplayOf } from './honour-functions';
import type { KkAvatarFunction } from './honour-types';

describe('honourDisplayOf', () => {
  it('puts the first board seat on the sash and ranks the rest board, admin, role', () => {
    const functions: KkAvatarFunction[] = [
      { kind: 'role', label: 'Admin', short: 'Admin', icon: 'shield' },
      { kind: 'board', label: 'Kasse', short: 'Kasse', icon: 'euro' },
      { kind: 'admin', label: 'Tanz', short: 'Tanz', icon: 'sparkle', tone: 'rose' },
      { kind: 'board', label: 'Schrift', short: 'Schrift', icon: 'pen' },
    ];

    const display = honourDisplayOf(functions);

    expect(display.sash?.label).toBe('Kasse');
    expect(display.coins.map((entry) => entry.label)).toEqual(['Schrift', 'Tanz', 'Admin']);
  });

  it('leaves the sash empty without a board seat', () => {
    const functions: KkAvatarFunction[] = [
      { kind: 'role', label: 'Foto', short: 'Foto', icon: 'camera' },
      { kind: 'admin', label: 'Technik', short: 'Technik', icon: 'bolt' },
    ];

    const display = honourDisplayOf(functions);

    expect(display.sash).toBeNull();
    expect(display.coins.map((entry) => entry.label)).toEqual(['Technik', 'Foto']);
  });
});

describe('honourCoinsOf', () => {
  const coins: KkAvatarFunction[] = [
    { kind: 'admin', label: 'A', short: 'A', icon: 'bolt' },
    { kind: 'admin', label: 'B', short: 'B', icon: 'mic' },
    { kind: 'role', label: 'C', short: 'C', icon: 'camera' },
    { kind: 'role', label: 'D', short: 'D', icon: 'shield' },
  ];

  it.each([
    [3, 3, ['function', 'function', 'function']],
    [4, 3, ['function', 'function', 'more']],
    [4, 1, ['function']],
    [2, 3, ['function', 'function']],
    [0, 3, []],
  ])('shows %i coins in %i slots', (count, max, kinds) => {
    expect(honourCoinsOf(coins.slice(0, count), max).map((coin) => coin.kind)).toEqual(kinds);
  });

  it('counts the hidden coins on the overflow coin and lists them', () => {
    const [, , overflow] = honourCoinsOf(coins, 3);

    expect(overflow).toEqual({ kind: 'more', key: 'more', count: 2, label: 'C · D' });
  });
});
