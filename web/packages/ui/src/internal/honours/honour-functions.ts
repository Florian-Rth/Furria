import type { KkAvatarFunction, KkAvatarFunctionKind } from './honour-types';

export interface HonourDisplay {
  sash: KkAvatarFunction | null;
  coins: KkAvatarFunction[];
}

export interface FunctionCoin {
  kind: 'function';
  key: string;
  function: KkAvatarFunction;
}

export interface OverflowCoin {
  kind: 'more';
  key: string;
  count: number;
  label: string;
}

export type HonourCoin = FunctionCoin | OverflowCoin;

const KIND_RANK: Record<KkAvatarFunctionKind, number> = { board: 0, admin: 1, role: 2 };
const OVERFLOW_SEPARATOR = ' · ';

export const honourDisplayOf = (functions: readonly KkAvatarFunction[]): HonourDisplay => {
  const ranked = functions
    .map((entry, order) => ({ entry, order }))
    .sort((a, b) => KIND_RANK[a.entry.kind] - KIND_RANK[b.entry.kind] || a.order - b.order)
    .map(({ entry }) => entry);
  const [first, ...rest] = ranked;

  if (first?.kind === 'board') {
    return { sash: first, coins: rest };
  }

  return { sash: null, coins: ranked };
};

const functionCoin = (entry: KkAvatarFunction, index: number): FunctionCoin => ({
  kind: 'function',
  key: `${entry.kind}-${index}-${entry.label}`,
  function: entry,
});

export const honourCoinsOf = (coins: readonly KkAvatarFunction[], max: number): HonourCoin[] => {
  if (coins.length <= max) {
    return coins.map(functionCoin);
  }
  if (max <= 1) {
    return coins.slice(0, Math.max(max, 0)).map(functionCoin);
  }

  const hidden = coins.slice(max - 1);

  return [
    ...coins.slice(0, max - 1).map(functionCoin),
    {
      kind: 'more',
      key: 'more',
      count: hidden.length,
      label: hidden.map((entry) => entry.label).join(OVERFLOW_SEPARATOR),
    },
  ];
};
